-- ============================================
-- CORREÇÃO URGENTE - RLS POLICY
-- Execute este SQL AGORA no Supabase
-- ============================================

-- Opção 1: Desabilitar RLS temporariamente (APENAS PARA TESTE)
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.obligations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.installments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates DISABLE ROW LEVEL SECURITY;

-- ============================================
-- IMPORTANTE: Isso remove a segurança!
-- Use apenas para testar se funciona.
-- Depois vamos configurar autenticação correta.
-- ============================================
