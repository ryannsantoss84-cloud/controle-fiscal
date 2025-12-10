import { useMemo } from "react";
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/empty-state";
import { TimelineWidget } from "@/components/dashboard/TimelineWidget";

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
  const { stats, isLoading } = useDashboard();
  const navigate = useNavigate();

  // Buscar próximas obrigações (lista expandida) com tipagem
  const { data: upcomingObligations } = useQuery<Obligation[]>({
    queryKey: ["dashboard-upcoming"],
    queryFn: async () => {
      const { data } = await supabase
        .from("obligations")
        .select("*, clients(name)")
        .eq("status", "pending")
        .gte("due_date", new Date().toISOString().split('T')[0])
        .order("due_date", { ascending: true })
        .limit(10);
      return (data || []) as Obligation[];
    }
  });

  // Buscar itens atrasados com tipagem
  const { data: overdueItems } = useQuery<Obligation[]>({
    queryKey: ["dashboard-overdue"],
    queryFn: async () => {
      const { data } = await supabase
        .from("obligations")
        .select("*, clients(name)")
        .eq("status", "overdue")
        .order("due_date", { ascending: true })
        .limit(5);
      return (data || []) as Obligation[];
    }
  });

  // Memoizar dados do timeline para evitar re-renders
  const timelineItems = useMemo(() => {
    return (upcomingObligations || []).map((item) => ({
      id: item.id,
      title: item.title,
      due_date: item.due_date,
      status: item.status,
      type: item.type,
      client_name: item.clients?.name,
      sphere: item.sphere
    }));
  }, [upcomingObligations]);

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
      <PageHeader
        title="Painel Operacional"
        description={`Visão focada em execução para hoje, ${format(new Date(), "dd 'de' MMMM", { locale: ptBR })}.`}
      />

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
            <div className="text-2xl font-bold text-red-600">{stats?.overdue || 0}</div>
            <p className="text-xs text-muted-foreground">Requerem atenção imediata</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift border-l-4 border-l-orange-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vence Hoje</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.due_today || 0}</div>
            <p className="text-xs text-muted-foreground">Prioridade do dia</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.total_pending || 0}</div>
            <p className="text-xs text-muted-foreground">Total em aberto</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift border-l-4 border-l-green-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Concluídos</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.completed_month || 0}</div>
            <p className="text-xs text-muted-foreground">Neste mês</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Lista de Atrasados (Se houver) */}
        {overdueItems && overdueItems.length > 0 && (
          <Card className="border-red-200 bg-red-50/30 dark:bg-red-900/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertCircle className="h-5 w-5" aria-hidden="true" />
                Atenção: Itens Atrasados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2" role="list" aria-label="Lista de itens atrasados">
                {overdueItems.map((item) => (
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
        <div className={overdueItems && overdueItems.length > 0 ? '' : 'col-span-2'}>
          <TimelineWidget items={timelineItems} />
        </div>
      </div>
    </div>
  );
}
