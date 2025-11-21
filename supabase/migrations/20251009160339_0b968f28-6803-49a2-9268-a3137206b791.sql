-- Habilitar RLS nas tabelas que faltam
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_types ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para clients
CREATE POLICY "Allow all access to clients" 
ON public.clients 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Criar políticas RLS para obligations
CREATE POLICY "Allow all access to obligations" 
ON public.obligations 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Criar políticas RLS para tax_types
CREATE POLICY "Allow all access to tax_types" 
ON public.tax_types 
FOR ALL 
USING (true) 
WITH CHECK (true);