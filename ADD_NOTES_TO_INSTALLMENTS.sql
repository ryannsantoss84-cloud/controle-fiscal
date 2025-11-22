ALTER TABLE installments 
ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE installments
ADD COLUMN IF NOT EXISTS original_due_date DATE;

-- Update the schema cache
NOTIFY pgrst, 'reload schema';
