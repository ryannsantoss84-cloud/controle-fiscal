-- ============================================================================
-- SOLUÇÃO TEMPORÁRIA - RLS SEM AUTENTICAÇÃO OBRIGATÓRIA
-- Use este script se você ainda não tem sistema de login
-- ============================================================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "clients_select" ON public.clients;
DROP POLICY IF EXISTS "clients_insert" ON public.clients;
DROP POLICY IF EXISTS "clients_update" ON public.clients;
DROP POLICY IF EXISTS "clients_delete" ON public.clients;

DROP POLICY IF EXISTS "obligations_select" ON public.obligations;
DROP POLICY IF EXISTS "obligations_insert" ON public.obligations;
DROP POLICY IF EXISTS "obligations_update" ON public.obligations;
DROP POLICY IF EXISTS "obligations_delete" ON public.obligations;

DROP POLICY IF EXISTS "installments_select" ON public.installments;
DROP POLICY IF EXISTS "installments_insert" ON public.installments;
DROP POLICY IF EXISTS "installments_update" ON public.installments;
DROP POLICY IF EXISTS "installments_delete" ON public.installments;

DROP POLICY IF EXISTS "templates_select" ON public.templates;
DROP POLICY IF EXISTS "templates_insert" ON public.templates;
DROP POLICY IF EXISTS "templates_update" ON public.templates;
DROP POLICY IF EXISTS "templates_delete" ON public.templates;

DROP POLICY IF EXISTS "settings_select" ON public.settings;
DROP POLICY IF EXISTS "settings_insert" ON public.settings;
DROP POLICY IF EXISTS "settings_update" ON public.settings;

-- DESABILITAR RLS TEMPORARIAMENTE (para desenvolvimento)
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.obligations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.installments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ⚠️ ATENÇÃO: Com RLS desabilitado, QUALQUER pessoa pode acessar os dados!
-- Isso é apenas para DESENVOLVIMENTO/TESTE
-- Quando você implementar login, execute o script de RLS correto
-- ============================================================================
