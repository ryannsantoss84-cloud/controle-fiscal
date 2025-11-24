-- FIX DEFINITIVO: Corrigir função generate_monthly_obligations
-- Problema identificado: sempre subtrai 1 dia (timezone ou off-by-one)

CREATE OR REPLACE FUNCTION public.generate_monthly_obligations(target_date DATE DEFAULT CURRENT_DATE)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    client_record RECORD;
    template_record RECORD;
    item_record JSONB;
    calculated_due_date DATE;
    inserted_count INT := 0;
    client_count INT := 0;
    day_of_week INT;
    weekend_rule TEXT;
    target_year INT;
    target_month INT;
    day_of_month INT;
BEGIN
    -- Usar o PRÓXIMO mês a partir da target_date
    target_year := EXTRACT(YEAR FROM (target_date + INTERVAL '1 month'))::INT;
    target_month := EXTRACT(MONTH FROM (target_date + INTERVAL '1 month'))::INT;
    
    RAISE NOTICE 'Gerando obrigações para: %/%', target_month, target_year;
    
    -- Loop por todos os clientes ativos
    FOR client_record IN SELECT * FROM clients WHERE status = 'active' LOOP
        client_count := client_count + 1;
        
        -- Loop pelos templates que batem com o regime do cliente
        FOR template_record IN 
            SELECT * FROM templates 
            WHERE tax_regimes @> ARRAY[client_record.tax_regime::text]
        LOOP
            -- Verificar se a atividade bate
            IF (
                template_record.business_activities IS NULL OR 
                cardinality(template_record.business_activities) = 0 OR
                client_record.business_activity = 'both' OR
                template_record.business_activities @> ARRAY['both'] OR
                template_record.business_activities @> ARRAY[client_record.business_activity::text]
            ) THEN
                
                -- Loop pelos itens do template
                IF template_record.items IS NOT NULL THEN
                    FOR item_record IN SELECT * FROM jsonb_array_elements(template_record.items)
                    LOOP
                        -- Pegar o dia do mês (padrão 10 se nulo)
                        day_of_month := COALESCE((item_record->>'day_of_month')::INT, 10);
                        
                        RAISE NOTICE 'Template: %, Dia configurado: %', item_record->>'title', day_of_month;
                        
                        -- Criar data DIRETAMENTE com make_date
                        -- NÃO fazer conversões ou ajustes antes de verificar weekend
                        BEGIN
                            calculated_due_date := make_date(target_year, target_month, day_of_month);
                        EXCEPTION WHEN OTHERS THEN
                            -- Se o dia não existe no mês, usa o último dia do mês
                            calculated_due_date := (make_date(target_year, target_month, 1) + INTERVAL '1 month - 1 day')::DATE;
                        END;
                        
                        RAISE NOTICE 'Data calculada (antes de weekend): %', calculated_due_date;

                        -- Verificar dia da semana ANTES de aplicar regra
                        day_of_week := EXTRACT(DOW FROM calculated_due_date);
                        RAISE NOTICE 'Dia da semana: % (0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sab)', day_of_week;

                        -- Regra de Fim de Semana - APENAS se for sábado ou domingo
                        weekend_rule := COALESCE(item_record->>'weekend_rule', 'postpone');
                        
                        IF day_of_week = 0 THEN -- Domingo
                            IF weekend_rule = 'postpone' OR weekend_rule = 'next_business_day' THEN
                                calculated_due_date := calculated_due_date + 1; -- Dom -> Seg
                                RAISE NOTICE 'Domingo detectado, ajustando para: %', calculated_due_date;
                            ELSIF weekend_rule = 'anticipate' OR weekend_rule = 'previous_business_day' THEN
                                calculated_due_date := calculated_due_date - 2; -- Dom -> Sex
                                RAISE NOTICE 'Domingo detectado, antecipando para: %', calculated_due_date;
                            END IF;
                        ELSIF day_of_week = 6 THEN -- Sábado
                            IF weekend_rule = 'postpone' OR weekend_rule = 'next_business_day' THEN
                                calculated_due_date := calculated_due_date + 2; -- Sab -> Seg
                                RAISE NOTICE 'Sábado detectado, ajustando para: %', calculated_due_date;
                            ELSIF weekend_rule = 'anticipate' OR weekend_rule = 'previous_business_day' THEN
                                calculated_due_date := calculated_due_date - 1; -- Sab -> Sex
                                RAISE NOTICE 'Sábado detectado, antecipando para: %', calculated_due_date;
                            END IF;
                        ELSE
                            RAISE NOTICE 'Dia útil - SEM ajuste de weekend';
                        END IF;
                        
                        RAISE NOTICE 'Data FINAL: %', calculated_due_date;

                        -- Inserir Obrigação (se não existir duplicata no mesmo mês)
                        IF NOT EXISTS (
                            SELECT 1 FROM obligations 
                            WHERE client_id = client_record.id 
                            AND title = (item_record->>'title')
                            AND date_trunc('month', obligations.due_date) = date_trunc('month', calculated_due_date)
                        ) THEN
                            INSERT INTO obligations (
                                client_id,
                                title,
                                description,
                                type,
                                recurrence,
                                due_date,
                                status,
                                amount
                            ) VALUES (
                                client_record.id,
                                item_record->>'title',
                                item_record->>'description',
                                COALESCE(item_record->>'type', 'obligation'),
                                COALESCE(item_record->>'recurrence', 'monthly'),
                                calculated_due_date,
                                'pending',
                                0
                            );
                            inserted_count := inserted_count + 1;
                            RAISE NOTICE 'Obrigação criada com sucesso';
                        ELSE
                            RAISE NOTICE 'Obrigação já existe para este mês';
                        END IF;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
    END LOOP;

    RETURN json_build_object(
        'status', 'success',
        'clients_processed', client_count,
        'obligations_created', inserted_count
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_monthly_obligations(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_monthly_obligations(DATE) TO service_role;
