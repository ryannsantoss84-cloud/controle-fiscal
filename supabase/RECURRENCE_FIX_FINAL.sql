-- SCRIPT DE CORREÇÃO FINAL & CALIBRAGEM DE DATAS
-- Este script corrige o problema de "datas andando" e ajusta o que foi criado hoje.

BEGIN;

-- 1. ATUALIZAR A FUNÇÃO PARA USAR A DATA ORIGINAL (Evita pular dias a mais)
CREATE OR REPLACE FUNCTION public.process_manual_recurrences(check_date DATE DEFAULT CURRENT_DATE)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    obs_record RECORD;
    base_date DATE;     -- Data base para cálculo (usa a original se tiver)
    target_date DATE;   -- Data alvo calculada (sem ajuste de fds ainda)
    final_date DATE;    -- Data final (com ajuste de fds)
    created_count INT := 0;
    weekend_rule TEXT;
    day_of_week INT;
BEGIN
    FOR obs_record IN 
        SELECT * FROM obligations 
        WHERE status = 'completed' 
        AND recurrence != 'none'
        AND due_date > (check_date - INTERVAL '6 months')
    LOOP
        -- SEGREDINHO DA CORREÇÃO: Usar original_due_date como base se existir
        -- Se não existir, usa a due_date mesmo
        base_date := COALESCE(obs_record.original_due_date, obs_record.due_date);

        -- Calcular a próxima data ideal (alvo)
        target_date := CASE obs_record.recurrence
            WHEN 'monthly' THEN base_date + INTERVAL '1 month'
            WHEN 'quarterly' THEN base_date + INTERVAL '3 months'
            WHEN 'semiannual' THEN base_date + INTERVAL '6 months'
            WHEN 'annual' THEN base_date + INTERVAL '1 year'
            ELSE NULL
        END;

        IF target_date IS NOT NULL THEN
            -- Agora aplicamos a regra de fim de semana na DATA ALVO
            weekend_rule := COALESCE(obs_record.weekend_handling, 'next_business_day');
            final_date := target_date;
            day_of_week := EXTRACT(DOW FROM target_date);

            IF weekend_rule IN ('postpone', 'next_business_day') THEN
                IF day_of_week = 0 THEN final_date := target_date + 1; -- Dom -> Seg
                ELSIF day_of_week = 6 THEN final_date := target_date + 2; -- Sab -> Seg
                END IF;
            ELSIF weekend_rule IN ('anticipate', 'previous_business_day') THEN
                IF day_of_week = 0 THEN final_date := target_date - 2; -- Dom -> Sex
                ELSIF day_of_week = 6 THEN final_date := target_date - 1; -- Sab -> Sex
                END IF;
            END IF;

            -- Verificar duplicidade
            PERFORM 1 FROM obligations 
            WHERE client_id = obs_record.client_id 
            AND title = obs_record.title
            AND date_trunc('month', due_date) = date_trunc('month', final_date);

            IF NOT FOUND THEN
                INSERT INTO obligations (
                    client_id, title, description, type,
                    due_date,               -- Data ajustada (pro usuário ver)
                    original_due_date,      -- Data original (pro sistema saber a base)
                    status, recurrence, amount, 
                    notes, responsible, weekend_handling
                ) VALUES (
                    obs_record.client_id, obs_record.title, obs_record.description, obs_record.type,
                    final_date,             -- Data ajustada
                    target_date,            -- Salva a data alvo como original
                    'pending', obs_record.recurrence, obs_record.amount,
                    obs_record.notes, obs_record.responsible, obs_record.weekend_handling
                );
                created_count := created_count + 1;
            END IF;
        END IF;
    END LOOP;

    RETURN json_build_object('status', 'success', 'items_created', created_count);
END;
$$;


-- 2. REPARAR AS OBRIGAÇÕES CRIADAS HOJE (Recalcular datas corretamente)
DO $$
DECLARE
    bad_record RECORD;
    predecessor RECORD;
    base_date DATE;
    target_date DATE;
    final_date DATE;
    weekend_rule TEXT;
    day_of_week INT;
BEGIN
    FOR bad_record IN 
        SELECT id, client_id, title FROM obligations 
        WHERE created_at >= CURRENT_DATE 
        AND status = 'pending'
    LOOP
        -- Achar quem gerou essa obrigação (a anterior completa)
        SELECT * INTO predecessor FROM obligations 
        WHERE client_id = bad_record.client_id 
        AND title = bad_record.title
        AND status = 'completed'
        ORDER BY due_date DESC
        LIMIT 1;

        IF FOUND THEN
            -- Recalcular com a lógica nova
            base_date := COALESCE(predecessor.original_due_date, predecessor.due_date);
            
            target_date := CASE predecessor.recurrence
                WHEN 'monthly' THEN base_date + INTERVAL '1 month'
                WHEN 'quarterly' THEN base_date + INTERVAL '3 months'
                WHEN 'semiannual' THEN base_date + INTERVAL '6 months'
                WHEN 'annual' THEN base_date + INTERVAL '1 year'
                ELSE NULL
            END;

            IF target_date IS NOT NULL THEN
                weekend_rule := COALESCE(predecessor.weekend_handling, 'next_business_day');
                final_date := target_date;
                day_of_week := EXTRACT(DOW FROM target_date);

                IF weekend_rule IN ('postpone', 'next_business_day') THEN
                    IF day_of_week = 0 THEN final_date := target_date + 1;
                    ELSIF day_of_week = 6 THEN final_date := target_date + 2;
                    END IF;
                ELSIF weekend_rule IN ('anticipate', 'previous_business_day') THEN
                    IF day_of_week = 0 THEN final_date := target_date - 2;
                    ELSIF day_of_week = 6 THEN final_date := target_date - 1;
                    END IF;
                END IF;

                -- Atualizar o registro "ruim" com as datas certas
                UPDATE obligations 
                SET due_date = final_date,
                    original_due_date = target_date,
                    type = predecessor.type -- Garante o tipo também
                WHERE id = bad_record.id;
            END IF;
        END IF;
    END LOOP;
END $$;

COMMIT;
