-- ============================================
-- ATUALIZAÇÃO: TEMPLATES COM MÚLTIPLOS ITENS E ATIVIDADES
-- ============================================

-- 1. Adicionar coluna de atividades (array de texto)
ALTER TABLE public.templates 
ADD COLUMN IF NOT EXISTS business_activities TEXT[] DEFAULT '{}';

-- 2. Adicionar coluna de itens (JSONB) para guardar múltiplas obrigações
ALTER TABLE public.templates 
ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;

-- 3. Migrar dados antigos:
-- Transforma os campos soltos (name, day, recurrence) no primeiro item do array JSON
UPDATE public.templates
SET items = jsonb_build_array(
  jsonb_build_object(
    'title', name,
    'description', description,
    'type', type,
    'recurrence', recurrence,
    'day_of_month', day_of_month
  )
)
WHERE items = '[]'::jsonb;

-- 4. Comentários
COMMENT ON COLUMN public.templates.business_activities IS 'Array of business activities: commerce, service, both';
COMMENT ON COLUMN public.templates.items IS 'List of obligations to generate: [{title, day_of_month, recurrence, type, description}]';

-- 5. Recarregar cache
NOTIFY pgrst, 'reload config';
