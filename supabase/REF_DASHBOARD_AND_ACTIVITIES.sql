-- 1. REFATORAÇÃO: Tabela de Atividades Econômicas
CREATE TABLE IF NOT EXISTS public.business_activities (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    code text NOT NULL UNIQUE, -- ex: 'commerce', 'service'
    label text NOT NULL, -- ex: 'Comércio', 'Serviço'
    created_at timestamptz DEFAULT now()
);

-- Inserir valores padrão e novos tipos
INSERT INTO public.business_activities (code, label) VALUES
('commerce', 'Comércio'),
('service', 'Serviço'),
('industry', 'Indústria'),
('third_sector', 'Terceiro Setor'),
('both', 'Ambos (Geral)')
ON CONFLICT (code) DO NOTHING;

-- 2. MELHORIA: Adicionar Status aos Clientes (Soft Delete)
-- Isso permite desativar clientes sem perder o histórico
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- 3. DASHBOARD: View para Estatísticas Rápidas
DROP VIEW IF EXISTS public.dashboard_stats;

CREATE OR REPLACE VIEW public.dashboard_stats AS
SELECT
    -- Total de Clientes Ativos
    (SELECT count(*) FROM clients WHERE status = 'active') as total_active_clients,
    
    -- Obrigações Vencendo Hoje
    (SELECT count(*) FROM obligations 
     WHERE status = 'pending' 
     AND due_date = CURRENT_DATE) as due_today,
     
    -- Obrigações Atrasadas (Vencidas e não pagas)
    (SELECT count(*) FROM obligations 
     WHERE status = 'pending' 
     AND due_date < CURRENT_DATE) as overdue,
     
    -- Obrigações Concluídas no Mês Atual
    (SELECT count(*) FROM obligations 
     WHERE status = 'paid' 
     AND date_trunc('month', due_date) = date_trunc('month', CURRENT_DATE)) as completed_month;

-- Permissões
GRANT SELECT ON public.business_activities TO authenticated;
GRANT SELECT ON public.dashboard_stats TO authenticated;

-- Notificar para recarregar schema
NOTIFY pgrst, 'reload config';
