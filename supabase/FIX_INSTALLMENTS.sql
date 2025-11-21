-- ============================================
-- VERIFICAR E CORRIGIR INSTALLMENTS
-- Execute este SQL no Supabase
-- ============================================

-- 1. Verificar se a tabela installments existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'installments'
) AS tabela_installments_existe;

-- 2. Verificar se a tabela installment_payments existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'installment_payments'
) AS tabela_installment_payments_existe;

-- 3. Se não existirem, criar as tabelas
CREATE TABLE IF NOT EXISTS public.installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  total_amount NUMERIC(15, 2) NOT NULL,
  installment_count INTEGER NOT NULL,
  paid_count INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.installment_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installment_id UUID REFERENCES public.installments(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  paid BOOLEAN DEFAULT false,
  paid_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 4. Habilitar RLS
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installment_payments ENABLE ROW LEVEL SECURITY;

-- 5. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can view their own installments" ON public.installments;
DROP POLICY IF EXISTS "Users can insert their own installments" ON public.installments;
DROP POLICY IF EXISTS "Users can update their own installments" ON public.installments;
DROP POLICY IF EXISTS "Users can delete their own installments" ON public.installments;

DROP POLICY IF EXISTS "Users can view payments of their installments" ON public.installment_payments;
DROP POLICY IF EXISTS "Users can insert payments for their installments" ON public.installment_payments;
DROP POLICY IF EXISTS "Users can update payments of their installments" ON public.installment_payments;
DROP POLICY IF EXISTS "Users can delete payments of their installments" ON public.installment_payments;

DROP POLICY IF EXISTS "Allow all for installments" ON public.installments;
DROP POLICY IF EXISTS "Allow all for installment_payments" ON public.installment_payments;

-- 6. Criar políticas permissivas
CREATE POLICY "Allow all for installments" ON public.installments
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for installment_payments" ON public.installment_payments
  FOR ALL USING (true) WITH CHECK (true);

-- 7. Criar índices
CREATE INDEX IF NOT EXISTS idx_installments_user_id ON public.installments(user_id);
CREATE INDEX IF NOT EXISTS idx_installments_client_id ON public.installments(client_id);
CREATE INDEX IF NOT EXISTS idx_installment_payments_installment_id ON public.installment_payments(installment_id);

-- 8. Criar trigger para updated_at
DROP TRIGGER IF EXISTS update_installments_updated_at ON public.installments;
CREATE TRIGGER update_installments_updated_at
  BEFORE UPDATE ON public.installments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_installment_payments_updated_at ON public.installment_payments;
CREATE TRIGGER update_installment_payments_updated_at
  BEFORE UPDATE ON public.installment_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- PRONTO! Parcelamentos devem funcionar agora!
-- ============================================
