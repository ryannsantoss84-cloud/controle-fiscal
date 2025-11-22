-- ============================================================================
-- ATUALIZAÇÃO DE INTELIGÊNCIA FISCAL
-- ============================================================================

CREATE OR REPLACE FUNCTION public.generate_monthly_obligations(target_date DATE DEFAULT CURRENT_DATE)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
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
    recurrence_type TEXT;
    current_month INT;
    should_generate BOOLEAN;
BEGIN
    current_month := EXTRACT(MONTH FROM target_date)::INT;

    FOR client_record IN 
        SELECT * FROM clients 
        WHERE status = 'active'
    LOOP
        client_count := client_count + 1;
        
        FOR template_record IN 
            SELECT * FROM templates 
            WHERE tax_regimes @> ARRAY[client_record.tax_regime::text]
        LOOP
            IF (
                template_record.business_activities IS NULL OR 
                cardinality(template_record.business_activities) = 0 OR
                client_record.business_activity = 'both' OR
                template_record.business_activities @> ARRAY['both'] OR
                template_record.business_activities @> ARRAY[client_record.business_activity::text]
            ) THEN
                IF template_record.items IS NOT NULL THEN
                    FOR item_record IN SELECT * FROM jsonb_array_elements(template_record.items)
                    LOOP
                        recurrence_type := COALESCE(item_record->>'recurrence', 'monthly');
                        should_generate := FALSE;

                        -- Lógica de Inteligência Fiscal
                        IF recurrence_type = 'monthly' THEN
                            should_generate := TRUE;
                        ELSIF recurrence_type = 'quarterly' THEN
                            -- Gera apenas em Jan(1), Abr(4), Jul(7), Out(10)
                            IF current_month IN (1, 4, 7, 10) THEN
                                should_generate := TRUE;
                            END IF;
                        ELSIF recurrence_type = 'semiannual' THEN
                            -- Gera apenas em Jan(1) e Jul(7)
                            IF current_month IN (1, 7) THEN
                                should_generate := TRUE;
                            END IF;
                        ELSIF recurrence_type = 'annual' THEN
                            -- Gera apenas em Janeiro(1)
                            IF current_month = 1 THEN
                                should_generate := TRUE;
                            END IF;
                        END IF;

                        IF should_generate THEN
                            calculated_due_date := make_date(
                                EXTRACT(YEAR FROM target_date)::INT,
                                EXTRACT(MONTH FROM target_date)::INT,
                                COALESCE((item_record->>'day_of_month')::INT, 10)
                            );

                            weekend_rule := COALESCE(item_record->>'weekend_rule', 'postpone');
                            day_of_week := EXTRACT(DOW FROM calculated_due_date);

                            IF weekend_rule IN ('postpone', 'next_business_day') THEN
                                IF day_of_week = 0 THEN calculated_due_date := calculated_due_date + 1;
                                ELSIF day_of_week = 6 THEN calculated_due_date := calculated_due_date + 2;
                                END IF;
                            ELSIF weekend_rule IN ('advance', 'previous_business_day') THEN
                                IF day_of_week = 0 THEN calculated_due_date := calculated_due_date - 2;
                                ELSIF day_of_week = 6 THEN calculated_due_date := calculated_due_date - 1;
                                END IF;
                            END IF;

                            IF NOT EXISTS (
                                SELECT 1 FROM obligations 
                                WHERE client_id = client_record.id 
                                AND title = (item_record->>'title')
                                AND date_trunc('month', obligations.due_date) = date_trunc('month', calculated_due_date)
                            ) THEN
                                INSERT INTO obligations (
                                    client_id, title, description, type, recurrence, due_date, status, amount, reference_date
                                ) VALUES (
                                    client_record.id,
                                    item_record->>'title',
                                    item_record->>'description',
                                    COALESCE(item_record->>'type', 'obligation'),
                                    recurrence_type,
                                    calculated_due_date,
                                    'pending',
                                    0,
                                    -- Define a competência como o dia 1 do mês ANTERIOR ao vencimento
                                    -- Ex: Vencimento em Nov -> Competência Out
                                    (target_date - INTERVAL '1 month')::DATE
                                );
                                inserted_count := inserted_count + 1;
                            END IF;
                        END IF;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
    END LOOP;

    RETURN json_build_object(
        'status', 'success',
        'clients_processed', client_count,
        'obligations_created', inserted_count,
        'date', target_date
    );
END;
$$;
