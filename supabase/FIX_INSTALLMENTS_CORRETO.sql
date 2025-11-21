-- ============================================
-- CORRIGIR ESTRUTURA DE INSTALLMENTS
-- O app espera uma estrutura diferente!
-- ============================================

-- 1. Dropar a tabela antiga se existir
DROP TABLE IF EXISTS public.installment_payments CASCADE;
DROP TABLE IF EXISTS public.installments CASCADE;

-- 2. Criar tabela installments com a estrutura CORRETA
CREATE TABLE public.installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obligation_id UUID REFERENCES public.obligations(id) ON DELETE CASCADE NOT NULL,
  installment_number INTEGER NOT NULL,
  total_installments INTEGER NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  due_date DATE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 3. Habilitar RLS
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;

-- 4. Criar política permissiva
CREATE POLICY "Allow all for installments" ON public.installments
  FOR ALL USING (true) WITH CHECK (true);

-- 5. Criar índices
CREATE INDEX idx_installments_obligation_id ON public.installments(obligation_id);
CREATE INDEX idx_installments_due_date ON public.installments(due_date);
CREATE INDEX idx_installments_status ON public.installments(status);

-- 6. Criar trigger para updated_at
CREATE TRIGGER update_installments_updated_at
  BEFORE UPDATE ON public.installments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- PRONTO! Agora installments deve funcionar!
-- ============================================
-- A estrutura agora corresponde ao que o app espera:
-- - obligation_id (não client_id)
-- - installment_number
-- - total_installments
-- - amount
-- - due_date
-- - paid_at
-- - status
-- ============================================
