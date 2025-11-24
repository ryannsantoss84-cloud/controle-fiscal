-- ============================================================================
-- SCRIPT DE VERIFICAÇÃO E OTIMIZAÇÃO - VERSÃO SIMPLIFICADA
-- Execute este script para garantir que tudo está funcionando
-- ============================================================================

-- 1. CRIAR VIEW DE DASHBOARD (se não existir)
-- ============================================================================

DROP VIEW IF EXISTS public.dashboard_stats;

CREATE OR REPLACE VIEW public.dashboard_stats AS
SELECT
    -- Total de Clientes Ativos
    (SELECT count(*) FROM clients WHERE status = 'active' OR status IS NULL) as total_active_clients,
    
    -- Obrigações Vencendo Hoje
    (SELECT count(*) FROM obligations 
     WHERE (status = 'pending' OR status IS NULL)
     AND due_date = CURRENT_DATE) as due_today,
     
    -- Obrigações Atrasadas (Vencidas e não concluídas)
    (SELECT count(*) FROM obligations 
     WHERE (status = 'pending' OR status IS NULL OR status = 'overdue')
     AND due_date < CURRENT_DATE) as overdue,
     
    -- Obrigações Concluídas no Mês Atual
    (SELECT count(*) FROM obligations 
     WHERE status = 'completed'
     AND date_trunc('month', completed_at) = date_trunc('month', CURRENT_DATE)) as completed_month;

-- cSpell:ignore desenvolvimento
-- Permissões para acesso sem autenticação (desenvolvimento)
GRANT SELECT ON public.dashboard_stats TO anon, authenticated;

-- ============================================================================
-- 2. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índices para melhorar performance das queries do dashboard
CREATE INDEX IF NOT EXISTS idx_obligations_status ON public.obligations(status);
CREATE INDEX IF NOT EXISTS idx_obligations_due_date ON public.obligations(due_date);
CREATE INDEX IF NOT EXISTS idx_obligations_completed_at ON public.obligations(completed_at);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);

-- Índices compostos para queries mais complexas
CREATE INDEX IF NOT EXISTS idx_obligations_status_due_date 
    ON public.obligations(status, due_date);

CREATE INDEX IF NOT EXISTS idx_obligations_client_status 
    ON public.obligations(client_id, status);

-- ============================================================================
-- 3. ATUALIZAR STATUS NULL PARA VALORES PADRÃO
-- ============================================================================

-- Garantir que todos os registros tenham status definido
UPDATE public.clients 
SET status = 'active' 
WHERE status IS NULL;

UPDATE public.obligations 
SET status = 'pending' 
WHERE status IS NULL AND completed_at IS NULL;

UPDATE public.obligations 
SET status = 'completed' 
WHERE status IS NULL AND completed_at IS NOT NULL;

-- ============================================================================
-- 4. CRIAR FUNÇÃO PARA ATUALIZAR STATUS AUTOMATICAMENTE
-- ============================================================================

CREATE OR REPLACE FUNCTION update_overdue_status()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Atualizar obrigações atrasadas
    UPDATE obligations
    SET status = 'overdue'
    WHERE status = 'pending'
    AND due_date < CURRENT_DATE;
END;
$$;

GRANT EXECUTE ON FUNCTION update_overdue_status() TO anon, authenticated;

-- ============================================================================
-- 5. VERIFICAR INTEGRIDADE DOS DADOS
-- ============================================================================

-- Contar registros em cada tabela
DO $$
DECLARE
    client_count INT;
    obligation_count INT;
    template_count INT;
BEGIN
    SELECT COUNT(*) INTO client_count FROM clients;
    SELECT COUNT(*) INTO obligation_count FROM obligations;
    SELECT COUNT(*) INTO template_count FROM templates;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICAÇÃO DE INTEGRIDADE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Clientes: %', client_count;
    RAISE NOTICE 'Obrigações: %', obligation_count;
    RAISE NOTICE 'Templates: %', template_count;
    RAISE NOTICE '========================================';
END $$;

-- ============================================================================
-- 6. TESTAR VIEW DO DASHBOARD
-- ============================================================================

-- Verificar se a view retorna dados
SELECT * FROM dashboard_stats;

-- ============================================================================
-- ✅ SCRIPT CONCLUÍDO!
-- ============================================================================
-- 
-- O que foi feito:
-- 1. ✅ Criada VIEW dashboard_stats com permissões corretas
-- 2. ✅ Criados índices para melhor performance
-- 3. ✅ Atualizados status NULL para valores padrão
-- 4. ✅ Criada função para atualizar status atrasados
-- 5. ✅ Verificada integridade dos dados
-- 6. ✅ Testada VIEW do dashboard
-- 
-- Próximos passos:
-- - Recarregue a aplicação (Ctrl + Shift + R)
-- - Verifique o Dashboard
-- - Todos os indicadores devem mostrar dados reais!
-- ============================================================================
