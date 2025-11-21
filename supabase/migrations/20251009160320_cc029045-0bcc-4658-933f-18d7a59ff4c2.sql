-- Criar tabela de impostos (taxes)
CREATE TABLE public.taxes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  tax_type_name text NOT NULL,
  description text,
  amount numeric,
  due_date date NOT NULL,
  paid_at timestamp with time zone,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  recurrence text NOT NULL DEFAULT 'none' CHECK (recurrence IN ('none', 'monthly', 'quarterly', 'semiannual', 'annual')),
  responsible text,
  notes text,
  weekend_handling text DEFAULT 'next_business_day' CHECK (weekend_handling IN ('advance', 'postpone', 'next_business_day')),
  original_due_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela taxes
ALTER TABLE public.taxes ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para taxes (acesso total por enquanto)
CREATE POLICY "Allow all access to taxes" 
ON public.taxes 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Adicionar colunas de weekend_handling em obligations
ALTER TABLE public.obligations 
ADD COLUMN weekend_handling text DEFAULT 'next_business_day' 
CHECK (weekend_handling IN ('advance', 'postpone', 'next_business_day'));

ALTER TABLE public.obligations 
ADD COLUMN original_due_date date;

-- Adicionar colunas de weekend_handling em installments
ALTER TABLE public.installments 
ADD COLUMN weekend_handling text DEFAULT 'next_business_day' 
CHECK (weekend_handling IN ('advance', 'postpone', 'next_business_day'));

ALTER TABLE public.installments 
ADD COLUMN original_due_date date;

-- Criar trigger para atualizar updated_at em taxes
CREATE TRIGGER update_taxes_updated_at
BEFORE UPDATE ON public.taxes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();