-- Add business_activity, state, and city columns to clients table
ALTER TABLE public.clients 
ADD COLUMN business_activity TEXT,
ADD COLUMN state TEXT,
ADD COLUMN city TEXT;

-- Add check constraint for valid business activities
ALTER TABLE public.clients 
ADD CONSTRAINT clients_business_activity_check 
CHECK (business_activity IN ('commerce', 'service', 'both'));

-- Add comment to columns
COMMENT ON COLUMN public.clients.business_activity IS 'Type of business activity: commerce, service, or both';
COMMENT ON COLUMN public.clients.state IS 'Brazilian state (UF) where the client is located';
COMMENT ON COLUMN public.clients.city IS 'City where the client is located';
