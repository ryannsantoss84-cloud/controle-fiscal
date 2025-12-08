import { useMemo } from 'react';

interface DeadlineItem {
    id: string;
    status: string;
    type?: string;
    sphere?: string;
    client_id?: string;
    due_date: string;
    time_spent_minutes?: number | null;
    clients?: { name: string } | null;
    [key: string]: unknown;
}

interface InstallmentItem {
    id: string;
    status: string;
    client_id?: string;
    due_date: string;
    amount?: number;
    [key: string]: unknown;
}

interface ClientItem {
    id: string;
    name: string;
    [key: string]: unknown;
}

interface AnalyticsMetrics {
    totalItems: number;
    completed: number;
    inProgress: number;
    pending: number;
    overdue: number;
    completedPercent: number;
    overduePercent: number;
    pendingPercent: number;
    inProgressPercent: number;
}

interface ClientStats {
    id: string;
    name: string;
    total: number;
    completed: number;
    overdue: number;
    completionRate: number;
    health: 'excellent' | 'good' | 'warning';
}

interface TimeStats {
    avgTimeGeneral: number | null;
    avgTimeTax: number | null;
    avgTimeObligation: number | null;
    avgTimeFederal: number | null;
    avgTimeState: number | null;
    avgTimeMunicipal: number | null;
    topSlowTasks: DeadlineItem[];
}

interface UseAnalyticsDataOptions {
    deadlines: DeadlineItem[];
    installments: InstallmentItem[];
    clients: ClientItem[];
    period: 'all' | 'week' | 'month' | 'year';
}

/**
 * Hook que calcula todas as métricas de analytics.
 * Centraliza a lógica de cálculo que estava no Analytics.tsx
 */
export function useAnalyticsData({
    deadlines,
    installments,
    clients,
    period,
}: UseAnalyticsDataOptions) {
    // Combinar todos os items
    const allItems = useMemo(() =>
        [...deadlines, ...installments] as (DeadlineItem | InstallmentItem)[],
        [deadlines, installments]
    );

    // Filtrar por período
    const filteredItems = useMemo(() => {
        if (period === 'all') return allItems;

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return allItems.filter(item => {
            const itemDate = new Date(item.due_date);

            switch (period) {
                case 'week': {
                    const weekStart = new Date(startOfToday);
                    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekEnd.getDate() + 6);
                    return itemDate >= weekStart && itemDate <= weekEnd;
                }
                case 'month': {
                    return (
                        itemDate.getMonth() === now.getMonth() &&
                        itemDate.getFullYear() === now.getFullYear()
                    );
                }
                case 'year': {
                    return itemDate.getFullYear() === now.getFullYear();
                }
                default:
                    return true;
            }
        });
    }, [allItems, period]);

    // Métricas principais
    const metrics = useMemo((): AnalyticsMetrics => {
        const totalItems = filteredItems.length;
        const completed = filteredItems.filter(
            item => item.status === 'completed' || item.status === 'paid'
        ).length;
        const inProgress = filteredItems.filter(
            item => item.status === 'in_progress'
        ).length;
        const pending = filteredItems.filter(
            item => item.status === 'pending'
        ).length;
        const overdue = filteredItems.filter(
            item => item.status === 'overdue'
        ).length;

        return {
            totalItems,
            completed,
            inProgress,
            pending,
            overdue,
            completedPercent: totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0,
            overduePercent: totalItems > 0 ? Math.round((overdue / totalItems) * 100) : 0,
            pendingPercent: totalItems > 0 ? Math.round((pending / totalItems) * 100) : 0,
            inProgressPercent: totalItems > 0 ? Math.round((inProgress / totalItems) * 100) : 0,
        };
    }, [filteredItems]);

    // Estatísticas por cliente
    const clientStats = useMemo((): ClientStats[] => {
        return clients
            .map(client => {
                const clientItems = filteredItems.filter(
                    item => 'client_id' in item && item.client_id === client.id
                );
                const total = clientItems.length;
                const completedCount = clientItems.filter(
                    item => item.status === 'completed' || item.status === 'paid'
                ).length;
                const overdueCount = clientItems.filter(
                    item => item.status === 'overdue'
                ).length;

                const health: ClientStats['health'] =
                    overdueCount === 0 ? 'excellent' : overdueCount < 3 ? 'good' : 'warning';

                return {
                    id: client.id,
                    name: client.name,
                    total,
                    completed: completedCount,
                    overdue: overdueCount,
                    completionRate: total > 0 ? Math.round((completedCount / total) * 100) : 0,
                    health,
                };
            })
            .filter(c => c.total > 0)
            .sort((a, b) => b.completionRate - a.completionRate);
    }, [clients, filteredItems]);

    // Estatísticas de tempo
    const timeStats = useMemo((): TimeStats => {
        const calculateAvg = (items: DeadlineItem[]): number | null => {
            const withTime = items.filter(d => d.time_spent_minutes);
            if (withTime.length === 0) return null;
            return withTime.reduce((sum, d) => sum + (d.time_spent_minutes || 0), 0) / withTime.length;
        };

        const completedDeadlines = deadlines.filter(
            d => d.status === 'completed' && d.time_spent_minutes
        );

        return {
            avgTimeGeneral: calculateAvg(completedDeadlines),
            avgTimeTax: calculateAvg(completedDeadlines.filter(d => d.type === 'tax')),
            avgTimeObligation: calculateAvg(completedDeadlines.filter(d => d.type === 'obligation')),
            avgTimeFederal: calculateAvg(completedDeadlines.filter(d => d.sphere === 'federal')),
            avgTimeState: calculateAvg(completedDeadlines.filter(d => d.sphere === 'state')),
            avgTimeMunicipal: calculateAvg(completedDeadlines.filter(d => d.sphere === 'municipal')),
            topSlowTasks: completedDeadlines
                .sort((a, b) => (b.time_spent_minutes || 0) - (a.time_spent_minutes || 0))
                .slice(0, 10),
        };
    }, [deadlines]);

    return {
        filteredItems,
        metrics,
        clientStats,
        timeStats,
        totalClients: clients.length,
    };
}

/**
 * Formata minutos para exibição legível.
 */
export function formatTimeMinutes(minutes: number | null): string {
    if (!minutes || minutes === 0) return '-';

    if (minutes < 60) {
        return `${Math.round(minutes)}min`;
    }

    if (minutes < 1440) {
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }

    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
}
