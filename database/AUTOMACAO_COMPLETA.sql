-- ============================================================================
-- AUTOMAÇÃO COMPLETA - Trigger para Gerar Obrigações Automaticamente
-- ============================================================================

-- Função que será executada automaticamente quando um cliente for criado
CREATE OR REPLACE FUNCTION auto_generate_obligations_for_new_client()
RETURNS TRIGGER AS $$
DECLARE
    template_record RECORD;
    item_record JSONB;
    calculated_due_date DATE;
    day_of_week INT;
    weekend_rule TEXT;
BEGIN
    -- Buscar templates que correspondem ao regime do novo cliente
    FOR template_record IN 
        SELECT * FROM templates 
        WHERE tax_regimes @> ARRAY[NEW.tax_regime::text]
    LOOP
        -- Verificar se o template se aplica à atividade do cliente
        IF (
            template_record.business_activities IS NULL OR 
            cardinality(template_record.business_activities) = 0 OR
            NEW.business_activity = 'both' OR
            template_record.business_activities @> ARRAY['both'] OR
            template_record.business_activities @> ARRAY[NEW.business_activity::text]
        ) THEN
            -- Processar cada item do template
            IF template_record.items IS NOT NULL THEN
                FOR item_record IN SELECT * FROM jsonb_array_elements(template_record.items)
                LOOP
                    -- Calcular data de vencimento
                    calculated_due_date := make_date(
                        EXTRACT(YEAR FROM CURRENT_DATE)::INT,
                        EXTRACT(MONTH FROM CURRENT_DATE)::INT,
                        COALESCE((item_record->>'day_of_month')::INT, 10)
                    );

                    -- Aplicar regra de final de semana
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

                    -- Criar obrigação se não existir
                    IF NOT EXISTS (
                        SELECT 1 FROM obligations 
                        WHERE client_id = NEW.id 
                        AND title = (item_record->>'title')
                        AND date_trunc('month', obligations.due_date) = date_trunc('month', calculated_due_date)
                    ) THEN
                        INSERT INTO obligations (
                            client_id, title, description, type, recurrence, due_date, status, amount
                        ) VALUES (
                            NEW.id,
                            item_record->>'title',
                            item_record->>'description',
                            COALESCE(item_record->>'type', 'obligation'),
                            COALESCE(item_record->>'recurrence', 'monthly'),
                            calculated_due_date,
                            'pending',
                            0
                        );
                    END IF;
                END LOOP;
            END IF;
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger que executa a função quando um cliente é criado
DROP TRIGGER IF EXISTS trigger_auto_generate_obligations ON public.clients;
CREATE TRIGGER trigger_auto_generate_obligations
    AFTER INSERT ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_obligations_for_new_client();

-- ============================================================================
-- Função para gerar obrigações mensais (melhorada)
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
BEGIN
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
        'obligations_created', inserted_count,
        'date', target_date
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_monthly_obligations(DATE) TO anon, authenticated;

-- ============================================================================
-- ✅ AUTOMAÇÃO CONFIGURADA!
-- ============================================================================
-- 
-- O que foi implementado:
-- 1. ✅ Trigger: Gera obrigações automaticamente ao criar cliente
-- 2. ✅ Função melhorada: generate_monthly_obligations
-- 
-- Próximo passo: Configurar automação diária (Cron)
-- ============================================================================
