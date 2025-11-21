-- Add new fields to installments table
ALTER TABLE public.installments 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS protocol TEXT,
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id);