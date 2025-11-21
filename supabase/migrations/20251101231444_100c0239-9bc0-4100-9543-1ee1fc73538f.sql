-- Tabela de configurações globais
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  auto_create_recurrences BOOLEAN DEFAULT true,
  default_weekend_handling TEXT DEFAULT 'next_business_day',
  notification_days_before INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de histórico de recorrências criadas
CREATE TABLE IF NOT EXISTS recurrence_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  original_id UUID,
  created_by_system BOOLEAN DEFAULT true,
  creation_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de regras de recorrência personalizadas
CREATE TABLE IF NOT EXISTS custom_recurrence_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  rule_type TEXT NOT NULL,
  rule_config JSONB,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar campos auxiliares às tabelas existentes
ALTER TABLE obligations ADD COLUMN IF NOT EXISTS auto_created BOOLEAN DEFAULT false;
ALTER TABLE obligations ADD COLUMN IF NOT EXISTS parent_id UUID;

ALTER TABLE taxes ADD COLUMN IF NOT EXISTS auto_created BOOLEAN DEFAULT false;
ALTER TABLE taxes ADD COLUMN IF NOT EXISTS parent_id UUID;

ALTER TABLE installments ADD COLUMN IF NOT EXISTS auto_created BOOLEAN DEFAULT false;
ALTER TABLE installments ADD COLUMN IF NOT EXISTS parent_id UUID;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_obligations_recurrence ON obligations(recurrence) WHERE recurrence != 'none';
CREATE INDEX IF NOT EXISTS idx_taxes_recurrence ON taxes(recurrence) WHERE recurrence != 'none';
CREATE INDEX IF NOT EXISTS idx_obligations_due_date ON obligations(due_date);
CREATE INDEX IF NOT EXISTS idx_taxes_due_date ON taxes(due_date);
CREATE INDEX IF NOT EXISTS idx_installments_due_date ON installments(due_date);

-- RLS Policies
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurrence_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_recurrence_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to settings" ON settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to recurrence_history" ON recurrence_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to custom_recurrence_rules" ON custom_recurrence_rules FOR ALL USING (true) WITH CHECK (true);