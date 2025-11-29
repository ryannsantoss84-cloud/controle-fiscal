-- Adiciona a coluna paid_at na tabela installments se ela não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'installments' AND column_name = 'paid_at') THEN
        ALTER TABLE public.installments ADD COLUMN paid_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;
