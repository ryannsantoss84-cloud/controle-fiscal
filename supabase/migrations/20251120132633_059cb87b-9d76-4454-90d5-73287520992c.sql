-- Add tax_regime column to clients table
ALTER TABLE public.clients 
ADD COLUMN tax_regime TEXT;

-- Add check constraint for valid tax regimes
ALTER TABLE public.clients 
ADD CONSTRAINT clients_tax_regime_check 
CHECK (tax_regime IN ('simples_nacional', 'lucro_presumido', 'lucro_real'));