-- ============================================
-- MIGRATION COMPLETA - CONTROL FISCAL LOV
-- Execute este SQL no novo Supabase
-- ============================================

-- 1. Criar tabela de clientes
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  document TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  tax_regime TEXT CHECK (tax_regime IN ('simples_nacional', 'lucro_presumido', 'lucro_real')),
  business_activity TEXT CHECK (business_activity IN ('commerce', 'service', 'both')),
  state TEXT,
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Criar tabela de obrigações (prazos)
CREATE TABLE IF NOT EXISTS public.obligations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  recurrence TEXT NOT NULL DEFAULT 'none' CHECK (recurrence IN ('none', 'monthly', 'quarterly', 'semiannual', 'annual')),
  type TEXT NOT NULL CHECK (type IN ('obligation', 'tax')),
  notes TEXT,
  responsible TEXT,
  weekend_handling TEXT,
  original_due_date DATE,
  amount NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Criar tabela de parcelamentos
CREATE TABLE IF NOT EXISTS public.installments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL,
  installment_count INTEGER NOT NULL,
  paid_count INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Criar tabela de parcelas individuais
CREATE TABLE IF NOT EXISTS public.installment_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  installment_id UUID REFERENCES public.installments(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  paid BOOLEAN DEFAULT false,
  paid_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Criar tabela de notificações
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deadline', 'installment', 'system')),
  read BOOLEAN DEFAULT false,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Criar tabela de templates
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('obligation', 'tax')),
  recurrence TEXT NOT NULL DEFAULT 'none' CHECK (recurrence IN ('none', 'monthly', 'quarterly', 'semiannual', 'annual')),
  day_of_month INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Habilitar Row Level Security (RLS)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installment_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- 8. Criar políticas RLS para clients
CREATE POLICY "Users can view their own clients" ON public.clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients" ON public.clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" ON public.clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" ON public.clients
  FOR DELETE USING (auth.uid() = user_id);

-- 9. Criar políticas RLS para obligations
CREATE POLICY "Users can view their own obligations" ON public.obligations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own obligations" ON public.obligations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own obligations" ON public.obligations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own obligations" ON public.obligations
  FOR DELETE USING (auth.uid() = user_id);

-- 10. Criar políticas RLS para installments
CREATE POLICY "Users can view their own installments" ON public.installments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own installments" ON public.installments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own installments" ON public.installments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own installments" ON public.installments
  FOR DELETE USING (auth.uid() = user_id);

-- 11. Criar políticas RLS para installment_payments
CREATE POLICY "Users can view payments of their installments" ON public.installment_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.installments
      WHERE installments.id = installment_payments.installment_id
      AND installments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert payments for their installments" ON public.installment_payments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.installments
      WHERE installments.id = installment_payments.installment_id
      AND installments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update payments of their installments" ON public.installment_payments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.installments
      WHERE installments.id = installment_payments.installment_id
      AND installments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete payments of their installments" ON public.installment_payments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.installments
      WHERE installments.id = installment_payments.installment_id
      AND installments.user_id = auth.uid()
    )
  );

-- 12. Criar políticas RLS para notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- 13. Criar políticas RLS para templates
CREATE POLICY "Users can view their own templates" ON public.templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates" ON public.templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" ON public.templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" ON public.templates
  FOR DELETE USING (auth.uid() = user_id);

-- 14. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_obligations_user_id ON public.obligations(user_id);
CREATE INDEX IF NOT EXISTS idx_obligations_client_id ON public.obligations(client_id);
CREATE INDEX IF NOT EXISTS idx_obligations_due_date ON public.obligations(due_date);
CREATE INDEX IF NOT EXISTS idx_obligations_status ON public.obligations(status);
CREATE INDEX IF NOT EXISTS idx_installments_user_id ON public.installments(user_id);
CREATE INDEX IF NOT EXISTS idx_installments_client_id ON public.installments(client_id);
CREATE INDEX IF NOT EXISTS idx_installment_payments_installment_id ON public.installment_payments(installment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON public.templates(user_id);

-- 15. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 16. Criar triggers para updated_at
CREATE TRIGGER set_updated_at_clients
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_obligations
  BEFORE UPDATE ON public.obligations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_installments
  BEFORE UPDATE ON public.installments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_installment_payments
  BEFORE UPDATE ON public.installment_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_templates
  BEFORE UPDATE ON public.templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 17. Adicionar comentários às colunas importantes
COMMENT ON COLUMN public.clients.business_activity IS 'Type of business activity: commerce, service, or both';
COMMENT ON COLUMN public.clients.state IS 'Brazilian state (UF) where the client is located';
COMMENT ON COLUMN public.clients.city IS 'City where the client is located';
COMMENT ON COLUMN public.obligations.amount IS 'Monetary value of the obligation or tax';
COMMENT ON COLUMN public.obligations.weekend_handling IS 'How to handle deadlines that fall on weekends';
COMMENT ON COLUMN public.obligations.original_due_date IS 'Original due date before weekend adjustments';

-- ============================================
-- MIGRATION COMPLETA!
-- ============================================
-- Agora seu banco de dados está pronto com:
-- ✅ Todas as tabelas criadas
-- ✅ Novos campos (business_activity, state, city, amount)
-- ✅ Row Level Security habilitado
-- ✅ Políticas de segurança configuradas
-- ✅ Índices para performance
-- ✅ Triggers para updated_at
-- ============================================
