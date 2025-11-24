-- ============================================================================
-- VERIFICAÇÃO E CORREÇÃO RÁPIDA - Tabela Clients
-- Execute este script se estiver tendo erro "Could not find the 'document' column"
-- ============================================================================

-- Verificar se a coluna cnpj existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clients' 
AND table_schema = 'public';

-- Se a coluna 'document' ainda existir, renomeie para 'cnpj'
-- (Descomente a linha abaixo se necessário)
-- ALTER TABLE public.clients RENAME COLUMN document TO cnpj;

-- Se a coluna 'cnpj' não existir, adicione
-- (Descomente a linha abaixo se necessário)
-- ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS cnpj TEXT;

-- ============================================================================
-- SOLUÇÃO DEFINITIVA: Recriar apenas a tabela clients
-- ============================================================================

-- 1. Backup dos dados (se houver)
CREATE TEMP TABLE clients_backup AS SELECT * FROM public.clients;

-- 2. Remover tabela antiga
DROP TABLE IF EXISTS public.clients CASCADE;

-- 3. Recriar tabela correta
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

-- 4. Restaurar dados (se houver)
INSERT INTO public.clients 
SELECT 
    id, 
    user_id, 
    name, 
    cnpj, 
    email, 
    phone, 
    address, 
    city, 
    state, 
    zip_code, 
    tax_regime, 
    business_activity, 
    status, 
    created_at, 
    updated_at 
FROM clients_backup;

-- 5. Recriar índices
CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_clients_tax_regime ON public.clients(tax_regime);

-- 6. Recriar RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own clients"
    ON public.clients FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clients"
    ON public.clients FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
    ON public.clients FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
    ON public.clients FOR DELETE
    USING (auth.uid() = user_id);

-- 7. Recriar trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ✅ PRONTO! Agora a tabela clients está correta com a coluna 'cnpj'
-- ============================================================================
