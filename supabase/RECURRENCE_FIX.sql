-- FUNÇÃO DE CORREÇÃO DE RECORRÊNCIA MANUAL
-- Executar este script no SQL Editor do Supabase para gerar as recorrências de Janeiro (ou mês atual)

CREATE OR REPLACE FUNCTION public.process_manual_recurrences(check_date DATE DEFAULT CURRENT_DATE)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    obs_record RECORD;
    tax_record RECORD;
    next_date DATE;
    start_of_next_month DATE;
    end_of_next_month DATE;
    created_obs INT := 0;
    created_tax INT := 0;
    processed_count INT := 0;
    weekend_rule TEXT;
    day_of_week INT;
BEGIN
    -- 1. PROCESSAR OBRIGAÇÕES (OBLIGATIONS)
    -- Busca todas as obrigações CONCLUÍDAS que têm recorrência
    FOR obs_record IN 
        SELECT * FROM obligations 
        WHERE status = 'completed' 
        AND recurrence != 'none'
        -- Opcional: filtrar apenas as recentes para não pegar coisas de anos atrás
        AND due_date > (check_date - INTERVAL '6 months')
    LOOP
        -- Calcular a próxima data baseada na recorrência
        next_date := CASE obs_record.recurrence
            WHEN 'monthly' THEN obs_record.due_date + INTERVAL '1 month'
            WHEN 'quarterly' THEN obs_record.due_date + INTERVAL '3 months'
            WHEN 'semiannual' THEN obs_record.due_date + INTERVAL '6 months'
            WHEN 'annual' THEN obs_record.due_date + INTERVAL '1 year'
            ELSE NULL
        END;

        IF next_date IS NOT NULL THEN
            -- Ajuste de Fim de Semana (Lógica Simples)
            weekend_rule := COALESCE(obs_record.weekend_handling, 'next_business_day');
            day_of_week := EXTRACT(DOW FROM next_date); -- 0=Domingo, 6=Sábado

            IF weekend_rule = 'postpone' OR weekend_rule = 'next_business_day' THEN
                IF day_of_week = 0 THEN next_date := next_date + 1; -- Dom -> Seg
                ELSIF day_of_week = 6 THEN next_date := next_date + 2; -- Sab -> Seg
                END IF;
            ELSIF weekend_rule = 'anticipate' OR weekend_rule = 'previous_business_day' THEN
                IF day_of_week = 0 THEN next_date := next_date - 2; -- Dom -> Sex
                ELSIF day_of_week = 6 THEN next_date := next_date - 1; -- Sab -> Sex
                END IF;
            END IF;

            -- Verificar se já existe (para evitar duplicidade)
            -- Verifica se existe obrigação com mesmo título e cliente no mês de vencimento calculado
            PERFORM 1 FROM obligations 
            WHERE client_id = obs_record.client_id 
            AND title = obs_record.title
            AND date_trunc('month', due_date) = date_trunc('month', next_date);

            IF NOT FOUND THEN
                -- Inserir a nova obrigação
                INSERT INTO obligations (
                    client_id, title, description, 
                    due_date, status, recurrence, amount, 
                    notes, responsible, weekend_handling
                ) VALUES (
                    obs_record.client_id, obs_record.title, obs_record.description,
                    next_date, 'pending', obs_record.recurrence, obs_record.amount,
                    obs_record.notes, obs_record.responsible, obs_record.weekend_handling
                );
                created_obs := created_obs + 1;
            END IF;
        END IF;
    END LOOP;

    -- 2. PROCESSAR IMPOSTOS (TAXES)
    -- Busca todos os impostos PAGOS que têm recorrência
    FOR tax_record IN 
        SELECT * FROM taxes 
        WHERE status = 'paid' 
        AND recurrence != 'none'
        AND due_date > (check_date - INTERVAL '6 months')
    LOOP
        -- Calcular a próxima data
        next_date := CASE tax_record.recurrence
            WHEN 'monthly' THEN tax_record.due_date + INTERVAL '1 month'
            WHEN 'quarterly' THEN tax_record.due_date + INTERVAL '3 months'
            WHEN 'semiannual' THEN tax_record.due_date + INTERVAL '6 months'
            WHEN 'annual' THEN tax_record.due_date + INTERVAL '1 year'
            ELSE NULL
        END;

        IF next_date IS NOT NULL THEN
            -- Ajuste de Fim de Semana
             weekend_rule := COALESCE(tax_record.weekend_handling, 'next_business_day');
            day_of_week := EXTRACT(DOW FROM next_date);

            IF weekend_rule = 'postpone' OR weekend_rule = 'next_business_day' THEN
                IF day_of_week = 0 THEN next_date := next_date + 1;
                ELSIF day_of_week = 6 THEN next_date := next_date + 2;
                END IF;
            ELSIF weekend_rule = 'anticipate' OR weekend_rule = 'previous_business_day' THEN
                IF day_of_week = 0 THEN next_date := next_date - 2;
                ELSIF day_of_week = 6 THEN next_date := next_date - 1;
                END IF;
            END IF;

            -- Verificar duplicidade
            PERFORM 1 FROM taxes 
            WHERE client_id = tax_record.client_id 
            AND tax_type_name = tax_record.tax_type_name
            AND date_trunc('month', due_date) = date_trunc('month', next_date);

            IF NOT FOUND THEN
                INSERT INTO taxes (
                    client_id, tax_type_name, description, amount,
                    due_date, status, recurrence, notes,
                    responsible, weekend_handling
                ) VALUES (
                    tax_record.client_id, tax_record.tax_type_name, tax_record.description, tax_record.amount,
                    next_date, 'pending', tax_record.recurrence, tax_record.notes,
                    tax_record.responsible, tax_record.weekend_handling
                );
                created_tax := created_tax + 1;
            END IF;
        END IF;
    END LOOP;

    RETURN json_build_object(
        'status', 'success',
        'obligations_created', created_obs,
        'taxes_created', created_tax
    );
END;
$$;

-- Executar a função imediatamente para gerar as pendências de hoje
SELECT public.process_manual_recurrences();
