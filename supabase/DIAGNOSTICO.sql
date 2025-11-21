-- ============================================
-- DIAGNÓSTICO DO BANCO DE DADOS
-- Execute este SQL no Supabase e me envie o resultado
-- ============================================

-- 1. Verificar se a tabela clients existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'clients'
) AS tabela_clients_existe;

-- 2. Listar todas as tabelas do schema public
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 3. Se a tabela clients existir, mostrar suas colunas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'clients'
ORDER BY ordinal_position;

-- 4. Verificar políticas RLS da tabela clients
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'clients';

-- 5. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'clients';
