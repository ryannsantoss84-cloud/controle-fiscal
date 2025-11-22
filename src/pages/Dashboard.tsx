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
      {/* Header Corporativo */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight gradient-text-primary">
          Painel de Controle
        </h1>
        <p className="text-muted-foreground text-base">
          Visão geral da sua gestão fiscal hoje, {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}.
        </p>
      </div>

      {/* Cards de Estatísticas Corporativos */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card hover-lift border-none shadow-elegant overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Atrasados</CardTitle>
            <div className="p-2 rounded-lg bg-red-500/10">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-red-600">{stats?.overdue || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Obrigações vencidas</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift border-none shadow-elegant overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Vence Hoje</CardTitle>
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-orange-600">{stats?.due_today || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Prioridade máxima</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift border-none shadow-elegant overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Concluídos (Mês)</CardTitle>
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-green-600">{stats?.completed_month || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Tarefas finalizadas</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift border-none shadow-elegant overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Obrigações Pendentes</CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-blue-600">
              {stats?.total_pending || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total em aberto</p>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Próximos Vencimentos e Produtividade */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">

        {/* Lista de Próximos Vencimentos */}
        <Card className="glass-card border-none shadow-elegant col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <div className="p-2 rounded-lg bg-primary/10">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              Próximos Vencimentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingObligations && upcomingObligations.length > 0 ? (
                upcomingObligations.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50 hover:bg-muted/50 hover:shadow-md transition-all">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold leading-none">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.clients?.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${new Date(item.due_date) < new Date() ? 'bg-red-500/10 text-red-700 border border-red-500/20' :
                        item.due_date === new Date().toISOString().split('T')[0] ? 'bg-orange-500/10 text-orange-700 border border-orange-500/20' :
                          'bg-primary/10 text-primary border border-primary/20'
                        }`}>
                        {formatDate(item.due_date).substring(0, 5)}
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

        {/* Card de Produtividade */}
        <Card className="glass-card border-none shadow-elegant col-span-3 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-primary">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5" />
              </div>
              Produtividade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Taxa de Conclusão</span>
                <span className="text-2xl font-bold gradient-text-primary">
                  {stats && (stats.completed_month + stats.overdue + stats.due_today) > 0
                    ? Math.round((stats.completed_month / (stats.completed_month + stats.overdue + stats.due_today)) * 100)
                    : 0}%
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full gradient-primary transition-all duration-500 shadow-lg"
                  style={{
                    width: `${stats && (stats.completed_month + stats.overdue + stats.due_today) > 0
                      ? Math.round((stats.completed_month / (stats.completed_month + stats.overdue + stats.due_today)) * 100)
                      : 0}%`
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Excelente trabalho! Você completou <span className="font-bold text-primary">{stats?.completed_month}</span> obrigações este mês.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
