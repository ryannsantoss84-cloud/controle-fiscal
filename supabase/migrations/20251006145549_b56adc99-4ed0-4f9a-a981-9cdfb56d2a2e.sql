-- Create enum for obligation status
CREATE TYPE public.obligation_status AS ENUM ('pending', 'in_progress', 'completed', 'overdue');

-- Create enum for recurrence type
CREATE TYPE public.recurrence_type AS ENUM ('monthly', 'quarterly', 'semiannual', 'annual', 'none');

-- Create clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  document TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create tax_types table
CREATE TABLE public.tax_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create obligations table
CREATE TABLE public.obligations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  tax_type_id UUID REFERENCES public.tax_types(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  status public.obligation_status DEFAULT 'pending' NOT NULL,
  recurrence public.recurrence_type DEFAULT 'none' NOT NULL,
  amount DECIMAL(15,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obligations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients
CREATE POLICY "Users can view their own clients"
  ON public.clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients"
  ON public.clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
  ON public.clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
  ON public.clients FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for tax_types
CREATE POLICY "Users can view their own tax types"
  ON public.tax_types FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tax types"
  ON public.tax_types FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tax types"
  ON public.tax_types FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tax types"
  ON public.tax_types FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for obligations
CREATE POLICY "Users can view their own obligations"
  ON public.obligations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own obligations"
  ON public.obligations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own obligations"
  ON public.obligations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own obligations"
  ON public.obligations FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_obligations_updated_at
  BEFORE UPDATE ON public.obligations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_tax_types_user_id ON public.tax_types(user_id);
CREATE INDEX idx_obligations_user_id ON public.obligations(user_id);
CREATE INDEX idx_obligations_client_id ON public.obligations(client_id);
CREATE INDEX idx_obligations_due_date ON public.obligations(due_date);
CREATE INDEX idx_obligations_status ON public.obligations(status);