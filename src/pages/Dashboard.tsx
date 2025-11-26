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
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/empty-state";

export default function Dashboard() {
  const { stats, isLoading } = useDashboard();
  const navigate = useNavigate();

  // Buscar próximas obrigações (lista expandida)
  const { data: upcomingObligations } = useQuery({
    queryKey: ["dashboard-upcoming"],
    queryFn: async () => {
      const { data } = await supabase
        .from("obligations")
        .select("*, clients(name)")
        .eq("status", "pending")
        .gte("due_date", new Date().toISOString().split('T')[0])
        .order("due_date", { ascending: true })
        .limit(10); // Aumentado para 10
      return data || [];
    }
  });

  // Buscar itens atrasados
  const { data: overdueItems } = useQuery({
    queryKey: ["dashboard-overdue"],
    queryFn: async () => {
      const { data } = await supabase
        .from("obligations")
        .select("*, clients(name)")
        .eq("status", "overdue")
        .order("due_date", { ascending: true })
        .limit(5);
      return data || [];
    }
  });

  if (isLoading) {
    return <div className="space-y-6 animate-fade-in">
      <Skeleton className="h-32 w-full rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
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
                <AlertCircle className="h-5 w-5" />
                Atenção: Itens Atrasados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {overdueItems.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-background rounded-md border border-red-100 shadow-sm">
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

        {/* Lista de Próximos Vencimentos */}
        <Card className={`glass-card border-none shadow-elegant ${overdueItems && overdueItems.length > 0 ? '' : 'col-span-2'}`}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <div className="p-2 rounded-lg bg-primary/10">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              Próximos Vencimentos
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/calendar')}>
              Ver Calendário <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingObligations && upcomingObligations.length > 0 ? (
                upcomingObligations.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50 hover:bg-muted/50 hover:shadow-md transition-all group">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold leading-none group-hover:text-primary transition-colors">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.clients?.name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${item.due_date === new Date().toISOString().split('T')[0] ? 'bg-orange-500/10 text-orange-700 border border-orange-500/20' :
                        'bg-primary/10 text-primary border border-primary/20'
                        }`}>
                        {formatDate(item.due_date)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={Check}
                  title="Tudo em dia!"
                  description="Nenhuma obrigação próxima encontrada."
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
