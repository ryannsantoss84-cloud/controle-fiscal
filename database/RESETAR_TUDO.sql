-- ============================================================================
-- SCRIPT SIMPLES - LIMPAR E RECRIAR TUDO
-- Este script ignora erros se as tabelas não existirem
-- ============================================================================

-- PARTE 1: LIMPAR TUDO (ignora erros)
-- ============================================================================

DO $$ 
BEGIN
    -- Remover tabelas se existirem
    DROP TABLE IF EXISTS public.installments CASCADE;
    DROP TABLE IF EXISTS public.obligations CASCADE;
    DROP TABLE IF EXISTS public.clients CASCADE;
    DROP TABLE IF EXISTS public.templates CASCADE;
    DROP TABLE IF EXISTS public.settings CASCADE;
    DROP TABLE IF EXISTS public.notifications CASCADE;
    DROP TABLE IF EXISTS public.business_activities CASCADE;
    
    -- Remover funções se existirem
    DROP FUNCTION IF EXISTS public.generate_monthly_obligations(DATE);
    DROP FUNCTION IF EXISTS public.update_updated_at_column();
    
    RAISE NOTICE 'Limpeza concluída!';
END $$;

-- PARTE 2: CRIAR TABELAS
-- ============================================================================

-- Tabela: CLIENTS
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    cnpj TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    tax_regime TEXT NOT NULL CHECK (tax_regime IN ('simples_nacional', 'lucro_presumido', 'lucro_real', 'mei')),
    business_activity TEXT NOT NULL CHECK (business_activity IN ('commerce', 'service', 'both')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela: OBLIGATIONS
CREATE TABLE public.obligations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'obligation' CHECK (type IN ('obligation', 'tax')),
    recurrence TEXT NOT NULL DEFAULT 'none' CHECK (recurrence IN ('none', 'monthly', 'quarterly', 'semiannual', 'annual')),
    due_date DATE NOT NULL,
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
    notes TEXT,
    responsible TEXT,
    weekend_handling TEXT CHECK (weekend_handling IN ('advance', 'postpone', 'next_business_day')),
    original_due_date DATE,
    amount NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela: INSTALLMENTS
CREATE TABLE public.installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    obligation_id UUID REFERENCES public.obligations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    protocol TEXT NOT NULL,
    installment_number INTEGER NOT NULL,
    total_installments INTEGER NOT NULL,
    due_date DATE NOT NULL,
    weekend_handling TEXT CHECK (weekend_handling IN ('advance', 'postpone', 'next_business_day')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
    amount NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_installment_number CHECK (installment_number > 0 AND installment_number <= total_installments)
);

-- Tabela: TEMPLATES
CREATE TABLE public.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    tax_regimes TEXT[] NOT NULL DEFAULT '{}',
    business_activities TEXT[] DEFAULT '{}',
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela: SETTINGS
CREATE TABLE public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    office_name TEXT,
    office_cnpj TEXT,
    default_weekend_handling TEXT DEFAULT 'next_business_day' CHECK (default_weekend_handling IN ('advance', 'postpone', 'next_business_day')),
    auto_create_recurrences BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PARTE 3: CRIAR ÍNDICES
-- ============================================================================

CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_obligations_user_id ON public.obligations(user_id);
CREATE INDEX idx_obligations_client_id ON public.obligations(client_id);
CREATE INDEX idx_obligations_status ON public.obligations(status);
CREATE INDEX idx_obligations_due_date ON public.obligations(due_date);
CREATE INDEX idx_installments_user_id ON public.installments(user_id);
CREATE INDEX idx_installments_client_id ON public.installments(client_id);
CREATE INDEX idx_templates_user_id ON public.templates(user_id);

-- PARTE 4: HABILITAR RLS
-- ============================================================================

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- PARTE 5: CRIAR POLÍTICAS RLS
-- ============================================================================

-- CLIENTS
CREATE POLICY "clients_select" ON public.clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "clients_insert" ON public.clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "clients_update" ON public.clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "clients_delete" ON public.clients FOR DELETE USING (auth.uid() = user_id);

-- OBLIGATIONS
CREATE POLICY "obligations_select" ON public.obligations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "obligations_insert" ON public.obligations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "obligations_update" ON public.obligations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "obligations_delete" ON public.obligations FOR DELETE USING (auth.uid() = user_id);

-- INSTALLMENTS
CREATE POLICY "installments_select" ON public.installments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "installments_insert" ON public.installments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "installments_update" ON public.installments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "installments_delete" ON public.installments FOR DELETE USING (auth.uid() = user_id);

-- TEMPLATES
CREATE POLICY "templates_select" ON public.templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "templates_insert" ON public.templates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "templates_update" ON public.templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "templates_delete" ON public.templates FOR DELETE USING (auth.uid() = user_id);

-- SETTINGS
CREATE POLICY "settings_select" ON public.settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "settings_insert" ON public.settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "settings_update" ON public.settings FOR UPDATE USING (auth.uid() = user_id);

-- PARTE 6: CRIAR FUNÇÕES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    FOR client_record IN 
        SELECT * FROM clients 
        WHERE status = 'active' AND user_id = current_user_id 
    LOOP
        client_count := client_count + 1;
        
        FOR template_record IN 
            SELECT * FROM templates 
            WHERE user_id = current_user_id
            AND tax_regimes @> ARRAY[client_record.tax_regime::text]
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
                            WHERE user_id = current_user_id
                            AND client_id = client_record.id 
                            AND title = (item_record->>'title')
                            AND date_trunc('month', obligations.due_date) = date_trunc('month', calculated_due_date)
                        ) THEN
                            INSERT INTO obligations (
                                user_id, client_id, title, description, type, recurrence, due_date, status, amount
                            ) VALUES (
                                current_user_id,
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

GRANT EXECUTE ON FUNCTION public.generate_monthly_obligations(DATE) TO authenticated;

-- PARTE 7: CRIAR TRIGGERS
-- ============================================================================

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_obligations_updated_at BEFORE UPDATE ON public.obligations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_installments_updated_at BEFORE UPDATE ON public.installments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ✅ CONCLUÍDO! Banco de dados recriado com sucesso!
-- ============================================================================
