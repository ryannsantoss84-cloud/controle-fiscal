import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardStats {
    total_active_clients: number;
    due_today: number;
    overdue: number;
    completed_month: number;
}

export function useDashboard() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ["dashboard-stats"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("dashboard_stats")
                .select("*")
                .single();

            if (error) {
                console.error("Erro ao carregar estatísticas:", error);
                return {
                    total_active_clients: 0,
                    due_today: 0,
                    overdue: 0,
                    completed_month: 0,
                } as DashboardStats;
            }

            return data as DashboardStats;
        },
        refetchInterval: 30000, // Atualiza a cada 30 segundos (Dashboard Vivo)
    });

    return {
        stats,
        isLoading,
    };
}
