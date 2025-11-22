-- SOLUÇÃO DEFINITIVA: Forçar data correta sem conversões de timezone
-- Remove TODOS os ajustes automáticos e usa apenas o dia configurado

CREATE OR REPLACE FUNCTION public.generate_monthly_obligations(target_date DATE DEFAULT CURRENT_DATE)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    client_record RECORD;
    template_record RECORD;
    item_record JSONB;
    final_due_date DATE;
    inserted_count INT := 0;
    client_count INT := 0;
    next_month_date DATE;
    day_to_use INT;
BEGIN
    -- Calcular o próximo mês
    next_month_date := target_date + INTERVAL '1 month';
    
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
                        -- Pegar o dia do mês
                        day_to_use := COALESCE((item_record->>'day_of_month')::INT, 10);
                        
                        -- Construir a data como STRING primeiro, depois converter
                        -- Isso evita problemas de timezone
                        final_due_date := (
                            EXTRACT(YEAR FROM next_month_date)::TEXT || '-' ||
                            LPAD(EXTRACT(MONTH FROM next_month_date)::TEXT, 2, '0') || '-' ||
                            LPAD(day_to_use::TEXT, 2, '0')
                        )::DATE;

                        -- Inserir Obrigação (se não existir duplicata no mesmo mês)
                        IF NOT EXISTS (
                            SELECT 1 FROM obligations 
                            WHERE client_id = client_record.id 
                            AND title = (item_record->>'title')
                            AND EXTRACT(YEAR FROM obligations.due_date) = EXTRACT(YEAR FROM final_due_date)
                            AND EXTRACT(MONTH FROM obligations.due_date) = EXTRACT(MONTH FROM final_due_date)
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
                                final_due_date,
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

GRANT EXECUTE ON FUNCTION public.generate_monthly_obligations(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_monthly_obligations(DATE) TO service_role;
