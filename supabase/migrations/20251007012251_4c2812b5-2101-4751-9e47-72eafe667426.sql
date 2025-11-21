-- Disable RLS on all tables to allow public access
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.obligations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_types DISABLE ROW LEVEL SECURITY;

-- Drop all RLS policies
DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clients;

DROP POLICY IF EXISTS "Users can view their own obligations" ON public.obligations;
DROP POLICY IF EXISTS "Users can insert their own obligations" ON public.obligations;
DROP POLICY IF EXISTS "Users can update their own obligations" ON public.obligations;
DROP POLICY IF EXISTS "Users can delete their own obligations" ON public.obligations;

DROP POLICY IF EXISTS "Users can view their own tax types" ON public.tax_types;
DROP POLICY IF EXISTS "Users can insert their own tax types" ON public.tax_types;
DROP POLICY IF EXISTS "Users can update their own tax types" ON public.tax_types;
DROP POLICY IF EXISTS "Users can delete their own tax types" ON public.tax_types;

-- Make user_id nullable and set default value
ALTER TABLE public.clients ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.clients ALTER COLUMN user_id SET DEFAULT '00000000-0000-0000-0000-000000000000'::uuid;

ALTER TABLE public.obligations ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.obligations ALTER COLUMN user_id SET DEFAULT '00000000-0000-0000-0000-000000000000'::uuid;

ALTER TABLE public.tax_types ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.tax_types ALTER COLUMN user_id SET DEFAULT '00000000-0000-0000-0000-000000000000'::uuid;