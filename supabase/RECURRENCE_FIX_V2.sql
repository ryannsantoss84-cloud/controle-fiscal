-- SCRIPT DE CORREÇÃO (REPAIR & UPDATE)
-- 1. Corrige as obrigações geradas hoje que deveriam ser impostos
-- 2. Atualiza a função para não errar nas próximas vezes

BEGIN;

-- PASSO 1: CORRIGIR OS REGISTROS CRIADOS HOJE
-- Se o item original era 'tax', o novo também deve ser.
UPDATE obligations new_obs
SET type = 'tax'
FROM obligations old_obs
WHERE new_obs.type = 'obligation'
  AND new_obs.status = 'pending'
  AND new_obs.created_at >= CURRENT_DATE -- Apenas as criadas hoje
  AND old_obs.client_id = new_obs.client_id
  AND old_obs.title = new_obs.title
  AND old_obs.status = 'completed'
  AND old_obs.type = 'tax';

COMMIT;

-- PASSO 2: ATUALIZAR A FUNÇÃO MESTRA (Para incluir o campo 'type')
CREATE OR REPLACE FUNCTION public.process_manual_recurrences(check_date DATE DEFAULT CURRENT_DATE)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    obs_record RECORD;
    next_date DATE;
    created_count INT := 0;
    weekend_rule TEXT;
    day_of_week INT;
BEGIN
    -- Busca TODAS as obrigações (inclusive impostos) concluídas
    FOR obs_record IN 
        SELECT * FROM obligations 
        WHERE status = 'completed' 
        AND recurrence != 'none'
        AND due_date > (check_date - INTERVAL '6 months')
    LOOP
        next_date := CASE obs_record.recurrence
            WHEN 'monthly' THEN obs_record.due_date + INTERVAL '1 month'
            WHEN 'quarterly' THEN obs_record.due_date + INTERVAL '3 months'
            WHEN 'semiannual' THEN obs_record.due_date + INTERVAL '6 months'
            WHEN 'annual' THEN obs_record.due_date + INTERVAL '1 year'
            ELSE NULL
        END;

        IF next_date IS NOT NULL THEN
            weekend_rule := COALESCE(obs_record.weekend_handling, 'next_business_day');
            day_of_week := EXTRACT(DOW FROM next_date);

            IF weekend_rule IN ('postpone', 'next_business_day') THEN
                IF day_of_week = 0 THEN next_date := next_date + 1;
                ELSIF day_of_week = 6 THEN next_date := next_date + 2;
                END IF;
            ELSIF weekend_rule IN ('anticipate', 'previous_business_day') THEN
                IF day_of_week = 0 THEN next_date := next_date - 2;
                ELSIF day_of_week = 6 THEN next_date := next_date - 1;
                END IF;
            END IF;

            PERFORM 1 FROM obligations 
            WHERE client_id = obs_record.client_id 
            AND title = obs_record.title
            AND date_trunc('month', due_date) = date_trunc('month', next_date);

            IF NOT FOUND THEN
                INSERT INTO obligations (
                    client_id, title, description, 
                    type, -- IMPORTANTE: Copia o tipo (obrigação ou imposto)
                    due_date, status, recurrence, amount, 
                    notes, responsible, weekend_handling
                ) VALUES (
                    obs_record.client_id, obs_record.title, obs_record.description,
                    obs_record.type, -- Valor do tipo original
                    next_date, 'pending', obs_record.recurrence, obs_record.amount,
                    obs_record.notes, obs_record.responsible, obs_record.weekend_handling
                );
                created_count := created_count + 1;
            END IF;
        END IF;
    END LOOP;

    RETURN json_build_object(
        'status', 'success',
        'items_processed', created_count
    );
END;
$$;
