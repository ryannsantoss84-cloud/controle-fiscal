import { useDashboard } from "@/hooks/useDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  CalendarDays
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const { stats, isLoading } = useDashboard();

  // Buscar próximas obrigações (mini-lista para o dashboard)
  const { data: upcomingObligations } = useQuery({
    queryKey: ["dashboard-upcoming"],
    queryFn: async () => {
      const { data } = await supabase
        .from("obligations")
        .select("*, clients(name)")
        .eq("status", "pending")
        .gte("due_date", new Date().toISOString().split('T')[0])
        .order("due_date", { ascending: true })
        .limit(5);
      return data || [];
    }
  });

  if (isLoading) {
    return <div className="p-8 space-y-4">
      <Skeleton className="h-32 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    </div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header com Saudação */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Painel de Controle
          </h1>
          <p className="text-muted-foreground">
            Visão geral da sua gestão fiscal hoje, {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}.
          </p>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasados</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.overdue || 0}</div>
            <p className="text-xs text-muted-foreground">Obrigações vencidas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vence Hoje</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.due_today || 0}</div>
            <p className="text-xs text-muted-foreground">Prioridade máxima</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos (Mês)</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.completed_month || 0}</div>
            <p className="text-xs text-muted-foreground">Tarefas finalizadas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.total_active_clients || 0}</div>
            <p className="text-xs text-muted-foreground">Base total</p>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Próximos Vencimentos e Gráfico (Placeholder) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

        {/* Lista de Próximos Vencimentos */}
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Próximos Vencimentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingObligations && upcomingObligations.length > 0 ? (
                upcomingObligations.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.clients?.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${new Date(item.due_date) < new Date() ? 'bg-red-100 text-red-700' :
                          item.due_date === new Date().toISOString().split('T')[0] ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                        }`}>
                        {format(new Date(item.due_date), "dd/MM")}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma obrigação próxima.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card de Ação Rápida / Status */}
        <Card className="col-span-3 bg-primary/5 border-primary/20 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <TrendingUp className="h-5 w-5" />
              Produtividade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Taxa de Conclusão</span>
                <span className="text-sm font-bold">
                  {stats && (stats.completed_month + stats.overdue + stats.due_today) > 0
                    ? Math.round((stats.completed_month / (stats.completed_month + stats.overdue + stats.due_today)) * 100)
                    : 0}%
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{
                    width: `${stats && (stats.completed_month + stats.overdue + stats.due_today) > 0
                      ? Math.round((stats.completed_month / (stats.completed_month + stats.overdue + stats.due_today)) * 100)
                      : 0}%`
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Mantenha o ritmo! Você completou {stats?.completed_month} obrigações este mês.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
