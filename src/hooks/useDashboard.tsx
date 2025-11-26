import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardStats {
    total_active_clients: number;
    due_today: number;
    overdue: number;
    completed_month: number;
    total_pending: number;
}

export function useDashboard() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ["dashboard-stats"],
        queryFn: async () => {
            // Tentar buscar da VIEW primeiro (DESATIVADO TEMPORARIAMENTE PARA GARANTIR DADOS REAIS)
            /*
            const { data: viewData, error: viewError } = await supabase
                .from("dashboard_stats")
                .select("*")
                .single();

            if (!viewError && viewData) {
                return viewData as DashboardStats;
            }
            */

            // Fallback: Buscar dados manualmente se a VIEW não existir
            // console.log("VIEW não encontrada, buscando dados manualmente...");

            try {
                // Buscar clientes ativos
                const { count: clientCount } = await supabase
                    .from("clients")
                    .select("*", { count: "exact", head: true })
                    .or("status.eq.active,status.is.null");

                // Buscar obrigações vencendo hoje (ajustado para fuso horário local)
                const now = new Date();
                const today = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
                    .toISOString()
                    .split('T')[0];

                const { count: obligationsDueToday } = await supabase
                    .from("obligations")
                    .select("*", { count: "exact", head: true })
                    .or("status.eq.pending,status.is.null")
                    .eq("due_date", today);

                const { count: installmentsDueToday } = await supabase
                    .from("installments")
                    .select("*", { count: "exact", head: true })
                    .or("status.eq.pending,status.is.null")
                    .eq("due_date", today);

                // Buscar obrigações atrasadas
                const { count: obligationsOverdue } = await supabase
                    .from("obligations")
                    .select("*", { count: "exact", head: true })
                    .or("status.eq.pending,status.eq.overdue,status.is.null")
                    .lt("due_date", today);

                const { count: installmentsOverdue } = await supabase
                    .from("installments")
                    .select("*", { count: "exact", head: true })
                    .or("status.eq.pending,status.eq.overdue,status.is.null")
                    .lt("due_date", today);

                // Buscar obrigações concluídas no mês
                const startOfMonth = new Date();
                startOfMonth.setDate(1);
                startOfMonth.setHours(0, 0, 0, 0);

                const { count: obligationsCompleted } = await supabase
                    .from("obligations")
                    .select("*", { count: "exact", head: true })
                    .eq("status", "completed")
                    .gte("completed_at", startOfMonth.toISOString());

                const { count: installmentsCompleted } = await supabase
                    .from("installments")
                    .select("*", { count: "exact", head: true })
                    .eq("status", "paid")
                    .gte("paid_at", startOfMonth.toISOString());

                // Calcular Total Pendente (Quantidade)
                const { count: obligationsPending } = await supabase
                    .from("obligations")
                    .select("*", { count: "exact", head: true })
                    .eq("status", "pending");

                const { count: installmentsPending } = await supabase
                    .from("installments")
                    .select("*", { count: "exact", head: true })
                    .eq("status", "pending");

                return {
                    total_active_clients: clientCount || 0,
                    due_today: (obligationsDueToday || 0) + (installmentsDueToday || 0),
                    overdue: (obligationsOverdue || 0) + (installmentsOverdue || 0),
                    completed_month: (obligationsCompleted || 0) + (installmentsCompleted || 0),
                    total_pending: (obligationsPending || 0) + (installmentsPending || 0),
                } as DashboardStats;

            } catch (error) {
                console.error("Erro ao carregar estatísticas:", error);
                return {
                    total_active_clients: 0,
                    due_today: 0,
                    overdue: 0,
                    completed_month: 0,
                    total_pending: 0,
                } as DashboardStats;
            }
        },
        refetchInterval: 30000, // Atualiza a cada 30 segundos (Dashboard Vivo)
        staleTime: 10000, // Considera dados frescos por 10 segundos
    });

    return {
        stats,
        isLoading,
    };
}
