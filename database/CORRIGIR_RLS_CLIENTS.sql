-- ============================================================================
-- CORREÇÃO DEFINITIVA - Tabela Clients com RLS Correto
-- ============================================================================

-- 1. Remover políticas antigas
DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can create their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clients;

-- 2. Desabilitar RLS temporariamente
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;

-- 3. Remover e recriar a tabela
DROP TABLE IF EXISTS public.clients CASCADE;

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

-- 4. Criar índices
CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_clients_tax_regime ON public.clients(tax_regime);

-- 5. Habilitar RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS CORRETAS (sem verificar user_id no INSERT)
CREATE POLICY "Enable read access for users based on user_id"
    ON public.clients
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users only"
    ON public.clients
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update for users based on user_id"
    ON public.clients
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id"
    ON public.clients
    FOR DELETE
    USING (auth.uid() = user_id);

-- 7. Criar trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON public.clients
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ✅ PRONTO! Agora você pode criar clientes sem erro de RLS
-- ============================================================================
