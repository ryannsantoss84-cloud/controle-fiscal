-- Verificar Policies existentes
SELECT * FROM pg_policies WHERE tablename IN ('obligations', 'installments');

-- Habilitar RLS (caso não esteja)
ALTER TABLE obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;

-- Policy para permitir tudo para usuários autenticados (para debug/desenvolvimento)
-- OBRIGAÇÕES
DROP POLICY IF EXISTS "Enable all for authenticated users" ON obligations;
CREATE POLICY "Enable all for authenticated users" ON obligations
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- PARCELAS
DROP POLICY IF EXISTS "Enable all for authenticated users" ON installments;
CREATE POLICY "Enable all for authenticated users" ON installments
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy para anon (se necessário, mas idealmente só authenticated)
-- Ajuste conforme sua auth. Se estiver usando anon key sem login, precisa disso:
DROP POLICY IF EXISTS "Enable all for anon" ON obligations;
CREATE POLICY "Enable all for anon" ON obligations
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for anon" ON installments;
CREATE POLICY "Enable all for anon" ON installments
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);
