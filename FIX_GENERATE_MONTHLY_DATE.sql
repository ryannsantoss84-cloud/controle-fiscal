-- Corrigir função generate_monthly_obligations
-- Bug: estava gerando obrigações para o mês atual em vez do próximo mês
-- Bug: estava usando make_date que pode falhar com dias inválidos

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
                        
                        -- Criar data corretamente: começar com dia 1, depois setar o dia correto
                        -- Isso evita erros com dias inválidos (ex: 31 de fevereiro)
                        calculated_due_date := make_date(target_year, target_month, 1);
                        
                        -- Tentar setar o dia desejado (se falhar, usa o último dia do mês)
                        BEGIN
                            calculated_due_date := make_date(target_year, target_month, day_of_month);
                        EXCEPTION WHEN OTHERS THEN
                            -- Se o dia não existe no mês (ex: 31 de fevereiro), usa o último dia do mês
                            calculated_due_date := (make_date(target_year, target_month, 1) + INTERVAL '1 month - 1 day')::DATE;
                        END;

                        -- Regra de Fim de Semana
                        weekend_rule := COALESCE(item_record->>'weekend_rule', 'postpone');
                        day_of_week := EXTRACT(DOW FROM calculated_due_date); -- 0=Dom, 6=Sab

                        IF weekend_rule = 'postpone' OR weekend_rule = 'next_business_day' THEN
                            IF day_of_week = 0 THEN calculated_due_date := calculated_due_date + 1; -- Dom -> Seg
                            ELSIF day_of_week = 6 THEN calculated_due_date := calculated_due_date + 2; -- Sab -> Seg
                            END IF;
                        ELSIF weekend_rule = 'anticipate' OR weekend_rule = 'previous_business_day' THEN
                            IF day_of_week = 0 THEN calculated_due_date := calculated_due_date - 2; -- Dom -> Sex
                            ELSIF day_of_week = 6 THEN calculated_due_date := calculated_due_date - 1; -- Sab -> Sex
                            END IF;
                        END IF;

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

-- Permissão para chamar a função via API
GRANT EXECUTE ON FUNCTION public.generate_monthly_obligations(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_monthly_obligations(DATE) TO service_role;
