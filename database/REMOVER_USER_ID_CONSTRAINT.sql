-- ============================================================================
-- SOLUÇÃO DEFINITIVA - REMOVER FOREIGN KEY DE USER_ID
-- Execute este script para permitir criar clientes sem usuário autenticado
-- ============================================================================

-- 1. Remover a constraint de foreign key em todas as tabelas
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_user_id_fkey;
ALTER TABLE public.obligations DROP CONSTRAINT IF EXISTS obligations_user_id_fkey;
ALTER TABLE public.installments DROP CONSTRAINT IF EXISTS installments_user_id_fkey;
ALTER TABLE public.templates DROP CONSTRAINT IF EXISTS templates_user_id_fkey;
ALTER TABLE public.settings DROP CONSTRAINT IF EXISTS settings_user_id_fkey;

-- 2. Tornar user_id opcional (permitir NULL)
ALTER TABLE public.clients ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.obligations ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.installments ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.templates ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.settings ALTER COLUMN user_id DROP NOT NULL;

-- 3. Desabilitar RLS em todas as tabelas
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.obligations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.installments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- 4. Remover todas as políticas RLS
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

-- ============================================================================
-- ✅ PRONTO! Agora você pode criar clientes sem problemas!
-- ============================================================================
-- 
-- ⚠️ IMPORTANTE: Esta configuração é para DESENVOLVIMENTO/TESTE
-- Quando implementar login, você precisará:
-- 1. Reabilitar as foreign keys
-- 2. Tornar user_id NOT NULL novamente
-- 3. Reabilitar RLS com políticas corretas
-- ============================================================================
