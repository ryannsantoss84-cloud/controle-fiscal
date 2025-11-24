-- Adicionar coluna de competência (reference_date) na tabela obligations
ALTER TABLE public.obligations 
ADD COLUMN IF NOT EXISTS reference_date DATE;

-- Comentário para documentação
COMMENT ON COLUMN public.obligations.reference_date IS 'Data de competência do imposto/obrigação (ex: 2024-01-01 para Janeiro/2024)';

-- Atualizar registros existentes para ter reference_date igual ao due_date (como fallback inicial)
UPDATE public.obligations 
SET reference_date = due_date 
WHERE reference_date IS NULL;
