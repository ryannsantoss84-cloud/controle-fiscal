-- Inspecionar colunas da tabela installments
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'installments';

-- Inspecionar constraints
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'installments'::regclass;

-- Inspecionar triggers
SELECT tgname, pg_get_triggerdef(oid)
FROM pg_trigger
WHERE tgrelid = 'installments'::regclass;

-- Inspecionar Policies (RLS)
select * from pg_policies where tablename = 'installments';
