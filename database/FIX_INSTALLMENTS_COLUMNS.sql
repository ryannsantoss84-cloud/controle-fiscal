-- ============================================================================
-- ADICIONAR COLUNAS FALTANTES NA TABELA INSTALLMENTS
-- Execute este SQL no Supabase para corrigir o erro de criação de parcelas
-- ============================================================================

-- 1. Adicionar coluna 'protocol' se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'installments' AND column_name = 'protocol') THEN
        ALTER TABLE public.installments ADD COLUMN protocol TEXT;
    END IF;
END $$;

-- 2. Adicionar coluna 'sphere' se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'installments' AND column_name = 'sphere') THEN
        ALTER TABLE public.installments ADD COLUMN sphere TEXT;
    END IF;
END $$;

-- 3. Adicionar coluna 'original_due_date' se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'installments' AND column_name = 'original_due_date') THEN
        ALTER TABLE public.installments ADD COLUMN original_due_date DATE;
    END IF;
END $$;

-- 4. Garantir que 'name' existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'installments' AND column_name = 'name') THEN
        ALTER TABLE public.installments ADD COLUMN name TEXT;
    END IF;
END $$;

-- 5. Garantir que 'due_date' existe (pode estar como start_date)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'installments' AND column_name = 'due_date') THEN
        ALTER TABLE public.installments ADD COLUMN due_date DATE;
    END IF;
END $$;

-- 6. Garantir que 'amount' existe como NUMERIC
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'installments' AND column_name = 'amount') THEN
        ALTER TABLE public.installments ADD COLUMN amount NUMERIC(15, 2) DEFAULT 0;
    END IF;
END $$;

-- 7. Garantir que 'installment_number' existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'installments' AND column_name = 'installment_number') THEN
        ALTER TABLE public.installments ADD COLUMN installment_number INTEGER DEFAULT 1;
    END IF;
END $$;

-- 8. Garantir que 'total_installments' existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'installments' AND column_name = 'total_installments') THEN
        ALTER TABLE public.installments ADD COLUMN total_installments INTEGER DEFAULT 1;
    END IF;
END $$;

-- 9. Garantir que 'obligation_id' é opcional
DO $$
BEGIN
    ALTER TABLE public.installments ALTER COLUMN obligation_id DROP NOT NULL;
EXCEPTION
    WHEN others THEN null;
END $$;

-- ============================================================================
-- ✅ PRONTO! Todas as colunas necessárias foram adicionadas.
-- ============================================================================
