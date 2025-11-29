-- ==============================================================================
-- SCRIPT DE CORREÇÃO DE ERROS V2 (RODE NO SUPABASE SQL EDITOR)
-- ==============================================================================

-- 1. Corrigir tabela INSTALLMENTS (Adicionar paid_at)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'installments' AND column_name = 'paid_at') THEN
        ALTER TABLE public.installments ADD COLUMN paid_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 2. Corrigir tabela SETTINGS (Adicionar colunas faltantes)
DO $$
BEGIN
    -- Adicionar office_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'settings' AND column_name = 'office_name') THEN
        ALTER TABLE public.settings ADD COLUMN office_name TEXT;
    END IF;

    -- Adicionar office_document
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'settings' AND column_name = 'office_document') THEN
        ALTER TABLE public.settings ADD COLUMN office_document TEXT;
    END IF;

    -- Adicionar notification_days_before
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'settings' AND column_name = 'notification_days_before') THEN
        ALTER TABLE public.settings ADD COLUMN notification_days_before INTEGER DEFAULT 7;
    END IF;
END $$;

-- 3. Inserir configurações padrão se a tabela estiver vazia
INSERT INTO public.settings (
    id, 
    office_name, 
    office_document, 
    default_weekend_handling, 
    auto_create_recurrences, 
    notification_days_before,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(), 
    'Meu Escritório', 
    '', 
    'next_business_day', 
    true, 
    7,
    now(),
    now()
WHERE NOT EXISTS (SELECT 1 FROM public.settings);

-- 4. Garantir permissões (RLS)
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'settings' AND policyname = 'Allow all access to settings') THEN
        CREATE POLICY "Allow all access to settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;
