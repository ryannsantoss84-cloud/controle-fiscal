import { useMemo, useState } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  CalendarDays,
  ArrowRight,
  Check
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { CardSkeleton } from "@/components/shared/CardSkeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/empty-state";
import { TimelineWidget } from "@/components/dashboard/TimelineWidget";
import { MonthPicker } from "@/components/ui/month-picker";

// Tipagem para obrigações
interface Obligation {
  id: string;
  title: string;
  due_date: string;
  status: string;
  type?: string;
  sphere?: string;
  clients?: { name: string } | null;
}

export default function Dashboard() {
  const navigate = useNavigate();
  // Mês atual como padrão
  const [monthFilter, setMonthFilter] = useState<Date>(new Date());

  // Datas de início e fim do mês selecionado
  const monthStart = format(startOfMonth(monthFilter), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(monthFilter), 'yyyy-MM-dd');
  const today = format(new Date(), 'yyyy-MM-dd');
  const isCurrentMonth = isSameMonth(monthFilter, new Date());

  // Buscar todas as obrigações do mês selecionado
  const { data: allObligations, isLoading } = useQuery<Obligation[]>({
    queryKey: ["dashboard-obligations", monthStart, monthEnd],
    queryFn: async () => {
      const { data } = await supabase
        .from("obligations")
        .select("*, clients(name)")
        .gte("due_date", monthStart)
        .lte("due_date", monthEnd)
        .order("due_date", { ascending: true });
      return (data || []) as Obligation[];
    }
  });

  // Buscar todas as parcelas do mês selecionado
  const { data: allInstallments } = useQuery<any[]>({
    queryKey: ["dashboard-installments", monthStart, monthEnd],
    queryFn: async () => {
      const { data } = await supabase
        .from("installments")
        .select("*, clients(name)")
        .gte("due_date", monthStart)
        .lte("due_date", monthEnd)
        .order("due_date", { ascending: true });
      return (data || []) as any[];
    }
  });

  // Calcular estatísticas do mês selecionado
  const monthStats = useMemo(() => {
    const obligations = allObligations || [];
    const installments = allInstallments || [];

    const overdueObligations = obligations.filter(o => o.status === 'overdue' || (o.status === 'pending' && o.due_date < today));
    const overdueInstallments = installments.filter(i => i.status === 'overdue' || (i.status === 'pending' && i.due_date < today));

    const dueTodayObligations = obligations.filter(o => o.due_date === today && o.status === 'pending');
    const dueTodayInstallments = installments.filter(i => i.due_date === today && i.status === 'pending');

    const pendingObligations = obligations.filter(o => o.status === 'pending');
    const pendingInstallments = installments.filter(i => i.status === 'pending');

    const completedObligations = obligations.filter(o => o.status === 'completed');
    const completedInstallments = installments.filter(i => i.status === 'paid');

    return {
      overdue: overdueObligations.length + overdueInstallments.length,
      dueToday: dueTodayObligations.length + dueTodayInstallments.length,
      pending: pendingObligations.length + pendingInstallments.length,
      completed: completedObligations.length + completedInstallments.length,
    };
  }, [allObligations, allInstallments, today]);

  // Filtrar pendentes para timeline
  const filteredUpcoming = useMemo(() => {
    return (allObligations || []).filter(o => o.status === 'pending' && o.due_date >= today);
  }, [allObligations, today]);

  // Filtrar atrasados
  const filteredOverdue = useMemo(() => {
    return (allObligations || []).filter(o => o.status === 'overdue' || (o.status === 'pending' && o.due_date < today));
  }, [allObligations, today]);

  // Memoizar dados do timeline para evitar re-renders
  const timelineItems = useMemo(() => {
    return filteredUpcoming.map((item) => ({
      id: item.id,
      title: item.title,
      due_date: item.due_date,
      status: item.status,
      type: item.type,
      client_name: item.clients?.name,
      sphere: item.sphere
    }));
  }, [filteredUpcoming]);

  if (isLoading) {
    return <div className="space-y-6 animate-fade-in">
      <CardSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>;
  }

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <PageHeader
          title="Painel Operacional"
          description={monthFilter
            ? `Visualizando: ${format(monthFilter, "MMMM 'de' yyyy", { locale: ptBR })}`
            : `Visão geral - ${format(new Date(), "dd 'de' MMMM", { locale: ptBR })}`
          }
        />
        <div className="flex items-center gap-2">
          <MonthPicker
            date={monthFilter}
            setDate={(date) => date && setMonthFilter(date)}
          />
        </div>
      </div>

      {/* Ações Rápidas */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Ações Rápidas
        </h2>
        <QuickActions />
      </section>

      {/* Cards de Resumo (Sem Gráficos) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card hover-lift border-l-4 border-l-red-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Atrasados</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{monthStats.overdue}</div>
            <p className="text-xs text-muted-foreground">No mês selecionado</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift border-l-4 border-l-orange-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vence Hoje</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{monthStats.dueToday}</div>
            <p className="text-xs text-muted-foreground">Prioridade do dia</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{monthStats.pending}</div>
            <p className="text-xs text-muted-foreground">No mês selecionado</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift border-l-4 border-l-green-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Concluídos</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{monthStats.completed}</div>
            <p className="text-xs text-muted-foreground">No mês selecionado</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Lista de Atrasados (Se houver) */}
        {filteredOverdue && filteredOverdue.length > 0 && (
          <Card className="border-red-200 bg-red-50/30 dark:bg-red-900/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertCircle className="h-5 w-5" aria-hidden="true" />
                Atenção: Itens Atrasados {monthFilter && `(${format(monthFilter, "MMM/yy", { locale: ptBR })})`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2" role="list" aria-label="Lista de itens atrasados">
                {filteredOverdue.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-background rounded-md border border-red-100 shadow-sm" role="listitem">
                    <div>
                      <p className="font-medium text-red-700">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.clients?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-600">{formatDate(item.due_date)}</p>
                      <Button variant="link" size="sm" className="h-auto p-0 text-red-600" onClick={() => navigate('/obligations')}>
                        Resolver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline de Vencimentos */}
        <div className={filteredOverdue && filteredOverdue.length > 0 ? '' : 'col-span-2'}>
          <TimelineWidget items={timelineItems as any} />
        </div>
      </div>
    </div>
  );
}
