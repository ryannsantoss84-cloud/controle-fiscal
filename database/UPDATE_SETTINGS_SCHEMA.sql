-- Adicionar colunas faltantes na tabela settings
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS office_name TEXT,
ADD COLUMN IF NOT EXISTS office_document TEXT;

-- Comentário para documentação
COMMENT ON COLUMN public.settings.office_name IS 'Nome do escritório de contabilidade';
COMMENT ON COLUMN public.settings.office_document IS 'CNPJ do escritório de contabilidade';

-- Atualizar permissões se necessário (geralmente herdado, mas bom garantir)
GRANT ALL ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role;
