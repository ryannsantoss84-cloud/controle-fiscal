-- Add type column to obligations table to support both obligations and taxes
ALTER TABLE public.obligations 
ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'obligation' CHECK (type IN ('obligation', 'tax'));