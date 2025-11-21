-- ============================================
-- ADICIONAR REGIMES AOS TEMPLATES
-- ============================================

-- 1. Adicionar coluna de regimes tributários (array de texto)
ALTER TABLE public.templates 
ADD COLUMN IF NOT EXISTS tax_regimes TEXT[] DEFAULT '{}';

-- 2. Atualizar a função de updated_at (garantia)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Comentário para documentação
COMMENT ON COLUMN public.templates.tax_regimes IS 'Array of tax regimes that this template applies to (e.g. ["simples_nacional", "lucro_presumido"])';

-- ============================================
-- PRONTO! Agora templates podem ser vinculados a regimes
-- ============================================
