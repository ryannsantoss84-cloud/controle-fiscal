-- ============================================================================
-- DESACOPLAMENTO DE PARCELAS
-- Permite criar parcelas sem estar vinculadas a uma obrigação
-- ============================================================================

-- 1. Tornar a coluna obligation_id opcional (nullable)
ALTER TABLE public.installments 
ALTER COLUMN obligation_id DROP NOT NULL;

-- 2. Garantir que temos uma coluna para descrever a parcela (já existe 'name', mas vamos garantir)
-- Se 'name' não existir, crie. Se existir, apenas garanta que é texto.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'installments' AND column_name = 'name') THEN
        ALTER TABLE public.installments ADD COLUMN name TEXT;
    END IF;
END $$;

-- 3. Atualizar constraints se houver alguma forçando NOT NULL (geralmente o ALTER COLUMN já resolve, mas bom verificar)

-- ============================================================================
-- ✅ PRONTO! Agora 'obligation_id' não é mais obrigatório.
-- ============================================================================
