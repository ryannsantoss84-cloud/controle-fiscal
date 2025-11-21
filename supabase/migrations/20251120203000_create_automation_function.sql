-- Função para gerar obrigações mensais em massa
-- Recria a função para garantir que ela exista e esteja correta

CREATE OR REPLACE FUNCTION public.generate_monthly_obligations(target_date DATE DEFAULT CURRENT_DATE)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    client_record RECORD;
    template_record RECORD;
    item_record JSONB;
    calculated_due_date DATE; -- Renomeado para evitar ambiguidade
    inserted_count INT := 0;
    client_count INT := 0;
    day_of_week INT;
    weekend_rule TEXT;
BEGIN
    -- Loop por todos os clientes ativos
    FOR client_record IN SELECT * FROM clients WHERE status = 'active' LOOP
        client_count := client_count + 1;
        
        -- Loop pelos templates que batem com o regime do cliente
        FOR template_record IN 
            SELECT * FROM templates 
            WHERE tax_regimes @> ARRAY[client_record.tax_regime::text]
        LOOP
            -- Verificar se a atividade bate (Comércio, Serviço ou Ambos)
            -- Se o template não especifica atividade, aplica a todos
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
                        -- Calcular Data de Vencimento Base
                        -- Pega o ano e mês da target_date, e o dia do item (ou 10 se nulo)
                        calculated_due_date := make_date(
                            EXTRACT(YEAR FROM target_date)::INT,
                            EXTRACT(MONTH FROM target_date)::INT,
                            COALESCE((item_record->>'day_of_month')::INT, 10)
                        );

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
                        -- Isso atende ao requisito: se já existe (mesmo completed), ignora. Se não existe (foi deletada), cria.
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
                END IF; -- Fim check items
            END IF; -- Fim check atividade
        END LOOP; -- Fim loop templates
    END LOOP; -- Fim loop clientes

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
