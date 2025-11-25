-- Create sphere_type enum
DO $$ BEGIN
  CREATE TYPE public.sphere_type AS ENUM ('federal', 'state', 'municipal');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add sphere column to obligations table
ALTER TABLE public.obligations 
ADD COLUMN IF NOT EXISTS sphere public.sphere_type;

-- Create index for sphere
CREATE INDEX IF NOT EXISTS idx_obligations_sphere ON public.obligations(sphere);
