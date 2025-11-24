-- ============================================================================
-- RELAXAR RESTRIÇÕES DE PARCELAS
-- Objetivo: Permitir parcelas sem valor e sem protocolo obrigatório
-- ============================================================================

-- 1. Tornar 'amount' opcional (pode ser nulo)
ALTER TABLE public.installments 
ALTER COLUMN amount DROP NOT NULL;

-- 2. Tornar 'protocol' opcional (pode ser nulo)
-- O erro anterior indicava que ele era NOT NULL
ALTER TABLE public.installments 
ALTER COLUMN protocol DROP NOT NULL;

-- 3. Garantir que colunas de controle de parcela existam (caso não existam)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'installments' AND column_name = 'installment_number') THEN
        ALTER TABLE public.installments ADD COLUMN installment_number INT DEFAULT 1;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'installments' AND column_name = 'total_installments') THEN
        ALTER TABLE public.installments ADD COLUMN total_installments INT DEFAULT 1;
    END IF;
END $$;

-- ============================================================================
-- ✅ PRONTO! Agora 'amount' e 'protocol' são opcionais.
-- ============================================================================
