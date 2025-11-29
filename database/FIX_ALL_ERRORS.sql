-- ==============================================================================
-- SCRIPT DE CORREÇÃO DE ERROS (RODE NO SUPABASE SQL EDITOR)
-- ==============================================================================

-- 1. Corrigir erro 400 na tabela installments (Adicionar coluna paid_at)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'installments' AND column_name = 'paid_at') THEN
        ALTER TABLE public.installments ADD COLUMN paid_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 2. Corrigir erro 406 na tabela settings (Inserir configurações padrão se estiver vazia)
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

-- 3. Garantir que a tabela settings tenha RLS habilitado e política de acesso
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'settings' AND policyname = 'Allow all access to settings') THEN
        CREATE POLICY "Allow all access to settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;
