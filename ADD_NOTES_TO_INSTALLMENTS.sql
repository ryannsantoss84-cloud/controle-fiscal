ALTER TABLE installments 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update the schema cache by notifying pgrst (optional, but good practice if possible, though usually automatic)
NOTIFY pgrst, 'reload schema';
