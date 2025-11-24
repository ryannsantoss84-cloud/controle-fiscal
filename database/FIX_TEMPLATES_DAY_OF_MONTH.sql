-- Corrigir estrutura da tabela templates
-- Adicionar todas as colunas necessárias que estão faltando

-- Adicionar coluna recurrence
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS recurrence TEXT;

-- Adicionar coluna day_of_month
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS day_of_month INTEGER;

-- Adicionar coluna type
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS type TEXT;

-- Adicionar coluna weekend_rule
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS weekend_rule TEXT DEFAULT 'postpone';

-- Adicionar comentários para documentação
COMMENT ON COLUMN templates.recurrence IS 'Frequência: none, monthly, quarterly, semiannual, annual';
COMMENT ON COLUMN templates.day_of_month IS 'Dia do mês para vencimento (1-31)';
COMMENT ON COLUMN templates.type IS 'Tipo: obligation ou tax';
COMMENT ON COLUMN templates.weekend_rule IS 'Regra para finais de semana: postpone, anticipate, keep';

-- Verificar a estrutura atualizada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'templates'
ORDER BY ordinal_position;
