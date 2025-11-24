-- ==============================================================================
-- INSTRUÇÕES:
-- 1. Copie todo o conteúdo deste arquivo.
-- 2. Vá para o painel do Supabase (https://supabase.com/dashboard).
-- 3. Abra o seu projeto -> SQL Editor.
-- 4. Cole o código e clique em "Run".
-- ==============================================================================

-- Função para gerar obrigações mensais com LÓGICA DE RECUPERAÇÃO INTELIGENTE
-- Se a obrigação foi deletada, ela será recriada.
-- Se a obrigação já existe (mesmo concluída), ela será mantida (não duplica).

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
BEGIN
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
                        -- Calcular Data de Vencimento
                        calculated_due_date := make_date(
                            EXTRACT(YEAR FROM target_date)::INT,
                            EXTRACT(MONTH FROM target_date)::INT,
                            COALESCE((item_record->>'day_of_month')::INT, 10)
                        );

                        -- Regra de Fim de Semana
                        weekend_rule := COALESCE(item_record->>'weekend_rule', 'postpone');
                        day_of_week := EXTRACT(DOW FROM calculated_due_date);

                        IF weekend_rule = 'postpone' OR weekend_rule = 'next_business_day' THEN
                            IF day_of_week = 0 THEN calculated_due_date := calculated_due_date + 1;
                            ELSIF day_of_week = 6 THEN calculated_due_date := calculated_due_date + 2;
                            END IF;
                        ELSIF weekend_rule = 'anticipate' OR weekend_rule = 'previous_business_day' THEN
                            IF day_of_week = 0 THEN calculated_due_date := calculated_due_date - 2;
                            ELSIF day_of_week = 6 THEN calculated_due_date := calculated_due_date - 1;
                            END IF;
                        END IF;

                        -- LÓGICA DE RECUPERAÇÃO:
                        -- Verifica se já existe uma obrigação deste tipo para este cliente neste mês.
                        -- Se existir (mesmo que status='completed'), NÃO faz nada.
                        -- Se NÃO existir (foi deletada ou nunca criada), CRIA uma nova 'pending'.
                        IF NOT EXISTS (
                            SELECT 1 FROM obligations 
                            WHERE client_id = client_record.id 
                            AND title = (item_record->>'title')
                            AND date_trunc('month', obligations.due_date) = date_trunc('month', calculated_due_date)
                        ) THEN
                            INSERT INTO obligations (
                                client_id, title, description, type, recurrence, due_date, status, amount
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

-- Permissões necessárias
GRANT EXECUTE ON FUNCTION public.generate_monthly_obligations(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_monthly_obligations(DATE) TO service_role;
