-- ============================================
-- SOLUÇÃO DEFINITIVA - RLS SEM AUTENTICAÇÃO
-- Execute este SQL no Supabase AGORA!
-- ============================================

-- 1. Remover todas as políticas antigas
DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clients;

DROP POLICY IF EXISTS "Users can view their own obligations" ON public.obligations;
DROP POLICY IF EXISTS "Users can insert their own obligations" ON public.obligations;
DROP POLICY IF EXISTS "Users can update their own obligations" ON public.obligations;
DROP POLICY IF EXISTS "Users can delete their own obligations" ON public.obligations;

-- 2. Criar políticas que permitem acesso TOTAL (sem autenticação)
-- ATENÇÃO: Isso permite que qualquer um acesse os dados!
-- Use apenas para desenvolvimento/teste

CREATE POLICY "Allow all for clients" ON public.clients
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for obligations" ON public.obligations
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for installments" ON public.installments
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for installment_payments" ON public.installment_payments
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for notifications" ON public.notifications
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for templates" ON public.templates
  FOR ALL USING (true) WITH CHECK (true);

-- 3. Garantir que RLS está habilitado (mas com políticas permissivas)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installment_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PRONTO! Agora deve funcionar!
-- ============================================
-- ⚠️ IMPORTANTE: Esta configuração é para DESENVOLVIMENTO
-- Em produção, você deve implementar autenticação adequada
-- ============================================
