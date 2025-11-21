
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDeadlines } from "@/hooks/useDeadlines";
import { useInstallments } from "@/hooks/useInstallments";
import { useClients } from "@/hooks/useClients";
import { useState } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--pending))'];

export default function Analytics() {
  const [period, setPeriod] = useState("all");
  const { deadlines } = useDeadlines();
  const { installments } = useInstallments();
  const { clients } = useClients();

  const allItems = [...deadlines, ...installments];

  // Métricas principais
  const totalItems = allItems.length;
  const completed = allItems.filter(item => item.status === 'completed' || item.status === 'paid').length;
  const inProgress = allItems.filter(item => item.status === 'in_progress').length;
  const pending = allItems.filter(item => item.status === 'pending').length;
  const overdue = allItems.filter(item => item.status === 'overdue').length;

  const completedPercent = totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0;
  const onTimePercent = completed > 0 ? Math.round((completed / totalItems) * 100) : 0;

  // Dados por cliente
  const clientData = clients.map(client => {
    const clientItems = allItems.filter(item => "client_id" in item && item.client_id === client.id);
    const total = clientItems.length;
    const completedCount = clientItems.filter(item => item.status === 'completed' || item.status === 'paid').length;
    const pendingCount = clientItems.filter(item => item.status === 'pending').length;
    const overdueCount = clientItems.filter(item => item.status === 'overdue').length;

    return {
      name: client.name,
      total,
      completed: completedCount,
      pending: pendingCount,
      overdue: overdueCount,
    };
  }).filter(c => c.total > 0);

  // Dados por tipo de prazo
  const deadlineTypeData = [
    { name: 'Obrigações', value: deadlines.filter(d => d.type === 'obligation').length },
    { name: 'Impostos', value: deadlines.filter(d => d.type === 'tax').length },
  ].filter(d => d.value > 0);

  // Dados por recorrência
  const recurrenceData = [
    { name: 'Mensal', value: deadlines.filter(o => o.recurrence === 'monthly').length },
    { name: 'Trimestral', value: deadlines.filter(o => o.recurrence === 'quarterly').length },
    { name: 'Semestral', value: deadlines.filter(o => o.recurrence === 'semiannual').length },
    { name: 'Anual', value: deadlines.filter(o => o.recurrence === 'annual').length },
    { name: 'Única', value: deadlines.filter(o => o.recurrence === 'none').length },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Análise de Desempenho</h1>
          <p className="text-muted-foreground mt-1">Visão geral e relatórios do sistema</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[200px]">
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

      {/* Cards de Métricas */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-normal text-muted-foreground">Concluídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{completed}</div>
            <p className="text-xs text-muted-foreground mt-1">{completedPercent}% do total</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-normal text-muted-foreground">No Prazo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-success">{completed}</div>
            <p className="text-xs text-muted-foreground mt-1">{onTimePercent}% das concluídas</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-normal text-muted-foreground">Em Andamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-pending">{inProgress}</div>
            <p className="text-xs text-muted-foreground mt-1">{totalItems > 0 ? Math.round((inProgress/totalItems)*100) : 0}% do total</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-normal text-muted-foreground">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Aguardando início</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-normal text-muted-foreground">Atrasadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-destructive">{overdue}</div>
            <p className="text-xs text-muted-foreground mt-1">Requerem atenção</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium">Por Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            {clientData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={clientData}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {clientData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Sem dados disponíveis
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium">Por Tipo de Prazo</CardTitle>
          </CardHeader>
          <CardContent>
            {deadlineTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={deadlineTypeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {deadlineTypeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Sem dados disponíveis
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium">Por Recorrência</CardTitle>
          </CardHeader>
          <CardContent>
            {recurrenceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={recurrenceData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Sem dados disponíveis
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium">Status Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[
                { name: 'Concluídas', value: completed },
                { name: 'Em Andamento', value: inProgress },
                { name: 'Pendentes', value: pending },
                { name: 'Atrasadas', value: overdue },
              ]}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Prazos por Cliente */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-medium">Prazos por Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium">Cliente</TableHead>
                <TableHead className="font-medium">Total</TableHead>
                <TableHead className="font-medium">Concluídas</TableHead>
                <TableHead className="font-medium">Pendentes</TableHead>
                <TableHead className="font-medium">Atrasadas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientData.map((client) => (
                <TableRow key={client.name}>
                  <TableCell className="font-normal">{client.name}</TableCell>
                  <TableCell>{client.total}</TableCell>
                  <TableCell className="text-success">{client.completed}</TableCell>
                  <TableCell>{client.pending}</TableCell>
                  <TableCell className="text-destructive">{client.overdue}</TableCell>
                </TableRow>
              ))}
              {clientData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum dado disponível
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
