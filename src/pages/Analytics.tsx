import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useDeadlines } from "@/hooks/useDeadlines";
import { useInstallments } from "@/hooks/useInstallments";
import { useClients } from "@/hooks/useClients";
import { useState, useMemo } from "react";
import {
  TrendingUp, TrendingDown, CheckCircle2, Clock,
  AlertCircle, Target, Users, Calendar, Award,
  Zap, Activity, BarChart3, PieChart as PieChartIcon
} from "lucide-react";

// Paleta de cores moderna
const COLORS = {
  primary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#a855f7',
  pink: '#ec4899',
  teal: '#14b8a6',
};

export default function Analytics() {
  const [period, setPeriod] = useState("all");
  const { deadlines } = useDeadlines({ pageSize: 1000 });
  const { installments } = useInstallments({ pageSize: 1000 });
  const { clients } = useClients({ pageSize: 1000 });

  const allItems = [...deadlines, ...installments];

  // Filter items by period
  const filteredItems = useMemo(() => {
    if (period === "all") return allItems;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return allItems.filter(item => {
      const itemDate = new Date(item.due_date);

      switch (period) {
        case "week": {
          const weekStart = new Date(startOfToday);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          return itemDate >= weekStart && itemDate <= weekEnd;
        }
        case "month": {
          return itemDate.getMonth() === now.getMonth() &&
            itemDate.getFullYear() === now.getFullYear();
        }
        case "year": {
          return itemDate.getFullYear() === now.getFullYear();
        }
        default:
          return true;
      }
    });
  }, [allItems, period]);

  // Métricas principais
  const metrics = useMemo(() => {
    const totalItems = filteredItems.length;
    const completed = filteredItems.filter(item => item.status === 'completed' || item.status === 'paid').length;
    const inProgress = filteredItems.filter(item => item.status === 'in_progress').length;
    const pending = filteredItems.filter(item => item.status === 'pending').length;
    const overdue = filteredItems.filter(item => item.status === 'overdue').length;

    return {
      totalItems,
      completed,
      inProgress,
      pending,
      overdue,
      completedPercent: totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0,
      overduePercent: totalItems > 0 ? Math.round((overdue / totalItems) * 100) : 0,
    };
  }, [filteredItems]);

  // Dados por cliente
  const clientStats = useMemo(() => {
    return clients.map(client => {
      const clientItems = filteredItems.filter(item => "client_id" in item && item.client_id === client.id);
      const total = clientItems.length;
      const completedCount = clientItems.filter(item => item.status === 'completed' || item.status === 'paid').length;
      const overdueCount = clientItems.filter(item => item.status === 'overdue').length;

      return {
        id: client.id,
        name: client.name,
        total,
        completed: completedCount,
        overdue: overdueCount,
        completionRate: total > 0 ? Math.round((completedCount / total) * 100) : 0,
        health: overdueCount === 0 ? 'excellent' : overdueCount < 3 ? 'good' : 'warning',
      };
    }).filter(c => c.total > 0).sort((a, b) => b.completionRate - a.completionRate);
  }, [clients, filteredItems]);

  // Progress Ring Component
  const ProgressRing = ({ percent, size = 120, strokeWidth = 12, color = COLORS.primary, label, value }: any) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percent / 100) * circumference;

    return (
      <div className="flex flex-col items-center gap-3">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={strokeWidth}
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold">{percent}%</div>
              <div className="text-xs text-muted-foreground">{value}</div>
            </div>
          </div>
        </div>
        <p className="text-sm font-medium text-center">{label}</p>
      </div>
    );
  };

  // Stat Card Component
  const StatCard = ({ icon: Icon, label, value, change, color, subtitle }: any) => (
    <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
      <div
        className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
        style={{ background: `linear-gradient(135deg, ${color} 0%, transparent 100%)` }}
      />
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div
            className="p-3 rounded-xl shadow-lg"
            style={{ background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)` }}
          >
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
          {change !== undefined && (
            <Badge
              variant={change >= 0 ? "default" : "destructive"}
              className="gap-1"
            >
              {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(change)}%
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );

  // Heatmap Cell Component
  const HeatmapCell = ({ value, max, label }: any) => {
    const intensity = max > 0 ? (value / max) : 0;
    const bgColor = intensity > 0.7 ? COLORS.success :
      intensity > 0.4 ? COLORS.warning :
        intensity > 0 ? COLORS.info : '#e5e7eb';

    return (
      <div
        className="aspect-square rounded-lg flex items-center justify-center text-white font-bold text-sm hover:scale-110 transition-transform cursor-pointer shadow-sm"
        style={{ backgroundColor: bgColor }}
        title={`${label}: ${value}`}
      >
        {value}
      </div>
    );
  };

  // Client Health Badge
  const HealthBadge = ({ health }: any) => {
    const config = {
      excellent: { label: 'Excelente', color: COLORS.success, icon: '🏆' },
      good: { label: 'Bom', color: COLORS.info, icon: '✅' },
      warning: { label: 'Atenção', color: COLORS.warning, icon: '⚠️' },
    };
    const { label, color, icon } = config[health as keyof typeof config];

    return (
      <span
        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white"
        style={{ backgroundColor: color }}
      >
        <span>{icon}</span>
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-background via-background to-muted/20 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight gradient-text-primary">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">Visualização inteligente de dados</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[200px] shadow-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os períodos</SelectItem>
            <SelectItem value="week">Esta semana</SelectItem>
            <SelectItem value="month">Este mês</SelectItem>
            <SelectItem value="year">Este ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Target}
          label="Taxa de Conclusão"
          value={`${metrics.completedPercent}%`}
          change={metrics.completedPercent > 70 ? 12 : -5}
          color={COLORS.success}
          subtitle={`${metrics.completed} de ${metrics.totalItems} tarefas`}
        />
        <StatCard
          icon={Activity}
          label="Em Andamento"
          value={metrics.inProgress}
          color={COLORS.info}
          subtitle="Tarefas ativas"
        />
        <StatCard
          icon={Clock}
          label="Pendentes"
          value={metrics.pending}
          color={COLORS.warning}
          subtitle="Aguardando início"
        />
        <StatCard
          icon={AlertCircle}
          label="Atrasadas"
          value={metrics.overdue}
          change={metrics.overduePercent > 10 ? -metrics.overduePercent : 0}
          color={COLORS.danger}
          subtitle={`${metrics.overduePercent}% do total`}
        />
      </div>

      {/* Progress Rings */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-primary" />
            Visão Geral de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-4">
            <ProgressRing
              percent={metrics.completedPercent}
              color={COLORS.success}
              label="Concluídas"
              value={`${metrics.completed}/${metrics.totalItems}`}
            />
            <ProgressRing
              percent={metrics.totalItems > 0 ? Math.round((metrics.inProgress / metrics.totalItems) * 100) : 0}
              color={COLORS.info}
              label="Em Andamento"
              value={metrics.inProgress}
            />
            <ProgressRing
              percent={metrics.totalItems > 0 ? Math.round((metrics.pending / metrics.totalItems) * 100) : 0}
              color={COLORS.warning}
              label="Pendentes"
              value={metrics.pending}
            />
            <ProgressRing
              percent={metrics.totalItems > 0 ? Math.round((metrics.overdue / metrics.totalItems) * 100) : 0}
              color={COLORS.danger}
              label="Atrasadas"
              value={metrics.overdue}
            />
          </div>
        </CardContent>
      </Card>

      {/* Client Performance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Ranking de Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clientStats.slice(0, 5).map((client, index) => (
                <div
                  key={client.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-muted/50 to-transparent hover:from-muted hover:to-muted/50 transition-all duration-300 group"
                >
                  {/* Ranking Badge */}
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-white text-lg shadow-lg ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                      index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                        'bg-gradient-to-br from-primary/60 to-primary/40'
                    }`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </div>

                  {/* Client Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{client.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {client.completed}/{client.total} concluídas
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-success to-success/60 transition-all duration-500"
                        style={{ width: `${client.completionRate}%` }}
                      />
                    </div>
                    <span className="font-bold text-lg min-w-[3rem] text-right">
                      {client.completionRate}%
                    </span>
                  </div>

                  {/* Health Badge */}
                  <HealthBadge health={client.health} />
                </div>
              ))}
              {clientStats.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  Nenhum cliente com tarefas
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activity Heatmap */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Mapa de Atividades por Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clientStats.slice(0, 6).map((client) => (
                <div key={client.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate max-w-[200px]">{client.name}</span>
                    <span className="text-xs text-muted-foreground">{client.total} tarefas</span>
                  </div>
                  <div className="grid grid-cols-10 gap-1">
                    {Array.from({ length: 10 }).map((_, i) => {
                      const segment = Math.ceil(client.total / 10);
                      const value = i < Math.ceil(client.completed / segment) ? segment :
                        i < Math.ceil((client.completed + client.overdue) / segment) ? Math.max(1, Math.floor(segment / 2)) : 0;
                      return (
                        <HeatmapCell
                          key={i}
                          value={value}
                          max={segment}
                          label={`Segmento ${i + 1}`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
              {clientStats.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  Sem dados para exibir
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-md bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-3xl font-bold">{clients.length}</p>
            <p className="text-sm text-muted-foreground">Clientes Ativos</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-success/10 to-success/5">
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-success" />
            <p className="text-3xl font-bold">{metrics.completed}</p>
            <p className="text-sm text-muted-foreground">Tarefas Concluídas</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-warning/10 to-warning/5">
          <CardContent className="p-6 text-center">
            <Zap className="w-8 h-8 mx-auto mb-2 text-warning" />
            <p className="text-3xl font-bold">{metrics.inProgress}</p>
            <p className="text-sm text-muted-foreground">Em Progresso</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-danger/10 to-danger/5">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-danger" />
            <p className="text-3xl font-bold">{metrics.overdue}</p>
            <p className="text-sm text-muted-foreground">Requerem Atenção</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
