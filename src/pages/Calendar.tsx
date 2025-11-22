import React, { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, isSameMonth, isToday, addMonths, subMonths, getDay, startOfWeek, endOfWeek, addDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Receipt, CreditCard,
  Filter, Plus, Building2, X, Search, TrendingUp, AlertCircle, CheckCircle2
} from "lucide-react";
import { useDeadlines } from "@/hooks/useDeadlines";
import { useInstallments } from "@/hooks/useInstallments";
import { useClients } from "@/hooks/useClients";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [typeFilter, setTypeFilter] = useState<"all" | "obligation" | "tax" | "installments">("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [selectedDayItems, setSelectedDayItems] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { deadlines } = useDeadlines();
  const { installments } = useInstallments();
  const { clients } = useClients();

  // Combinar todos os itens
  const allItems = useMemo(() => [
    ...deadlines,
    ...installments.map((i: any) => ({ ...i, type: 'installment' })),
  ], [deadlines, installments]);

  // Aplicar filtros
  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      // Filtro de tipo
      if (typeFilter !== "all") {
        if (typeFilter === "obligation" && item.type !== "obligation") return false;
        if (typeFilter === "tax" && item.type !== "tax") return false;
        if (typeFilter === "installments" && item.type !== "installment") return false;
      }

      // Filtro de cliente
      if (clientFilter !== "all") {
        const itemClientId = item.type === 'installment'
          ? (item.obligations?.client_id || item.client_id)
          : item.client_id;
        if (itemClientId !== clientFilter) return false;
      }

      // Filtro de status
      if (statusFilter !== "all" && item.status !== statusFilter) return false;

      // Busca por texto
      if (searchTerm) {
        const title = item.type === 'installment'
          ? `Parcela ${item.installment_number}/${item.total_installments}`
          : item.title;
        const clientName = item.type === 'installment'
          ? (item.obligations?.clients?.name || item.clients?.name)
          : item.clients?.name;

        const searchLower = searchTerm.toLowerCase();
        return title?.toLowerCase().includes(searchLower) ||
          clientName?.toLowerCase().includes(searchLower);
      }

      return true;
    });
  }, [allItems, typeFilter, clientFilter, statusFilter, searchTerm]);

  // Agrupar por data
  const itemsByDate = useMemo(() => {
    return filteredItems.reduce((acc: any, item: any) => {
      const dueDate = item.due_date;
      if (!dueDate) return acc;

      if (!acc[dueDate]) acc[dueDate] = [];

      let title = "";
      let client = null;

      if (item.type === 'installment') {
        title = `Parcela ${item.installment_number}/${item.total_installments}`;
        if (item.obligations?.title) title += ` - ${item.obligations.title}`;
        client = item.obligations?.clients || item.clients;
      } else {
        title = item.title;
        client = item.clients;
      }

      acc[dueDate].push({
        ...item,
        displayTitle: title,
        displayClient: client,
      });

      return acc;
    }, {});
  }, [filteredItems]);

  // Estatísticas
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      total: filteredItems.length,
      today: filteredItems.filter(i => i.due_date === today).length,
      overdue: filteredItems.filter(i => i.status === 'overdue').length,
      completed: filteredItems.filter(i => i.status === 'completed' || i.status === 'paid').length,
      byType: {
        obligation: filteredItems.filter(i => i.type === 'obligation').length,
        tax: filteredItems.filter(i => i.type === 'tax').length,
        installment: filteredItems.filter(i => i.type === 'installment').length,
      }
    };
  }, [filteredItems]);

  // Gerar grid do calendário
  const calendarWeeks = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { locale: ptBR });
    const endDate = endOfWeek(monthEnd, { locale: ptBR });

    const weeks = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        days.push(day);
        day = addDays(day, 1);
      }
      weeks.push(days);
      days = [];
    }
    return weeks;
  }, [currentDate]);

  const handleDayClick = (day: Date, items: any[]) => {
    if (items.length === 1) {
      setSelectedItem(items[0]);
    } else if (items.length > 1) {
      setSelectedDayItems(items);
      setSelectedDate(day);
      setIsDayModalOpen(true);
    }
  };

  const clearFilters = () => {
    setTypeFilter("all");
    setClientFilter("all");
    setStatusFilter("all");
    setSearchTerm("");
  };

  const hasActiveFilters = typeFilter !== "all" || clientFilter !== "all" || statusFilter !== "all" || searchTerm !== "";

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-background via-background to-muted/10 min-h-screen">
      {/* Header Premium */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight gradient-text-primary">
              Calendário Fiscal
            </h1>
            <p className="text-muted-foreground mt-1">Gestão visual inteligente de vencimentos</p>
          </div>

          {/* Navegação de Mês */}
          <div className="flex items-center gap-2 bg-card p-1 rounded-xl border shadow-lg">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="h-9 w-9 hover:bg-primary/10"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="px-6 font-bold min-w-[180px] text-center text-lg">
              {format(currentDate, "MMMM yyyy", { locale: ptBR })}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="h-9 w-9 hover:bg-primary/10"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
              className="font-medium"
            >
              Hoje
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="border-none shadow-lg bg-gradient-to-br from-primary/10 to-primary/5 hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total</p>
                  <p className="text-3xl font-bold mt-1">{stats.total}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Hoje</p>
                  <p className="text-3xl font-bold mt-1 text-blue-600">{stats.today}</p>
                </div>
                <CalendarIcon className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-red-500/10 to-red-500/5 hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Atrasadas</p>
                  <p className="text-3xl font-bold mt-1 text-red-600">{stats.overdue}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-green-500/10 to-green-500/5 hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Concluídas</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros Avançados */}
        <Card className="border-none shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 items-center">
              {/* Busca */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título ou cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Filtro de Tipo */}
              <div className="flex gap-2">
                <Button
                  variant={typeFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter('all')}
                  className="gap-2"
                >
                  Todos
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{stats.total}</Badge>
                </Button>
                <Button
                  variant={typeFilter === 'obligation' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter('obligation')}
                  className="gap-2"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  Obrigações
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{stats.byType.obligation}</Badge>
                </Button>
                <Button
                  variant={typeFilter === 'tax' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter('tax')}
                  className="gap-2"
                >
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  Impostos
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{stats.byType.tax}</Badge>
                </Button>
                <Button
                  variant={typeFilter === 'installments' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter('installments')}
                  className="gap-2"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  Parcelamentos
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{stats.byType.installment}</Badge>
                </Button>
              </div>

              {/* Filtro de Cliente */}
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="w-[200px]">
                  <Building2 className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Todos os clientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os clientes</SelectItem>
                  {clients.map((client: any) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filtro de Status */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="overdue">Atrasado</SelectItem>
                </SelectContent>
              </Select>

              {/* Limpar Filtros */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                  Limpar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Legenda Interativa */}
        <Card className="border-none shadow-lg bg-gradient-to-r from-muted/30 to-muted/10">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-6 items-center justify-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm" />
                <span className="text-sm font-medium">Obrigações</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500 shadow-sm" />
                <span className="text-sm font-medium">Impostos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
                <span className="text-sm font-medium">Parcelamentos</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-md">
                  15
                </div>
                <span className="text-sm font-medium">Hoje</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-xs">
                  S
                </div>
                <span className="text-sm font-medium">Final de Semana</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid do Calendário */}
      <Card className="border-none shadow-2xl overflow-hidden">
        <CardContent className="p-0">
          {/* Cabeçalho dos Dias */}
          <div className="grid grid-cols-7 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border-b">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day, idx) => (
              <div
                key={day}
                className={`py-4 text-center text-sm font-bold uppercase tracking-wider ${idx === 0 || idx === 6 ? 'text-muted-foreground' : 'text-foreground'
                  }`}
              >
                {day}
              </div>
            ))}</div>

          {/* Dias */}
          <div className="grid grid-cols-7 auto-rows-fr bg-border gap-px">
            {calendarWeeks.map((week, weekIndex) => (
              <React.Fragment key={weekIndex}>
                {week.map((day) => {
                  const dayStr = format(day, "yyyy-MM-dd");
                  const items = itemsByDate[dayStr] || [];
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isCurrentDay = isToday(day);
                  const dayOfWeek = getDay(day);
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => handleDayClick(day, items)}
                      className={`
                        min-h-[140px] p-3 transition-all cursor-pointer group relative
                        bg-card hover:bg-accent/10 hover:shadow-lg
                        ${!isCurrentMonth ? "bg-muted/20 text-muted-foreground" : ""}
                        ${isWeekend ? "bg-muted/10" : ""}
                        ${isCurrentDay ? "ring-2 ring-primary ring-inset" : ""}
                      `}
                    >
                      {/* Número do Dia */}
                      <div className="flex justify-between items-start mb-2">
                        <span
                          className={`
                            text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full transition-all
                            ${isCurrentDay
                              ? "bg-primary text-primary-foreground shadow-lg scale-110"
                              : "text-muted-foreground group-hover:text-foreground group-hover:bg-muted group-hover:scale-105"
                            }
                            ${!isCurrentMonth ? "opacity-40" : ""}
                          `}
                        >
                          {format(day, "d")}
                        </span>

                        {/* Contador de Itens */}
                        {items.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="h-5 px-1.5 text-[10px] font-bold bg-primary/20 text-primary"
                          >
                            {items.length}
                          </Badge>
                        )}
                      </div>

                      {/* Lista de Itens */}
                      <div className="space-y-1">
                        {items.slice(0, 3).map((item: any) => {
                          let colorClass = "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30";
                          if (item.type === 'tax') colorClass = "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30";
                          if (item.type === 'installment') colorClass = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";

                          const isCompleted = item.status === 'completed' || item.status === 'paid';
                          const isOverdue = item.status === 'overdue';

                          return (
                            <div
                              key={item.id}
                              className={`
                                text-[10px] px-2 py-1 rounded-md border truncate transition-all hover:scale-105
                                ${colorClass}
                                ${isCompleted ? "opacity-50 line-through" : ""}
                                ${isOverdue ? "border-red-500 bg-red-500/10 text-red-600" : ""}
                              `}
                              title={`${item.displayTitle} - ${item.displayClient?.name || ''}`}
                            >
                              <div className="flex items-center gap-1">
                                <div className={`w-1 h-1 rounded-full ${isOverdue ? 'bg-red-500' : 'bg-current'}`} />
                                <span className="truncate font-semibold">
                                  {item.displayClient?.name && <span className="opacity-75 mr-1">{item.displayClient.name.split(' ')[0]}:</span>}
                                  {item.displayTitle}
                                </span>
                              </div>
                            </div>
                          );
                        })}

                        {items.length > 3 && (
                          <div className="text-[10px] font-bold text-primary pl-2">
                            +{items.length - 3} mais
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes do Item */}
      <Dialog open={!!selectedItem && !isDayModalOpen} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-md">
          {selectedItem && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-3 rounded-xl shadow-lg ${selectedItem.type === 'tax' ? 'bg-orange-100 text-orange-600' :
                    selectedItem.type === 'installment' ? 'bg-emerald-100 text-emerald-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                    {selectedItem.type === 'obligation' && <CalendarIcon className="h-6 w-6" />}
                    {selectedItem.type === 'tax' && <Receipt className="h-6 w-6" />}
                    {selectedItem.type === 'installment' && <CreditCard className="h-6 w-6" />}
                  </div>
                  <div>
                    <DialogTitle className="text-xl">{selectedItem.displayTitle}</DialogTitle>
                    <DialogDescription className="text-xs uppercase tracking-wider font-semibold mt-1">
                      {selectedItem.type === 'obligation' ? 'Obrigação Fiscal' :
                        selectedItem.type === 'tax' ? 'Imposto' : 'Parcelamento'}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl border">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground font-semibold uppercase">Status</span>
                    <StatusBadge status={selectedItem.status} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground font-semibold uppercase">Vencimento</span>
                    <span className="font-bold text-sm">
                      {format(new Date(selectedItem.due_date), "dd/MM/yyyy")}
                    </span>
                  </div>
                </div>

                {selectedItem.displayClient && (
                  <div className="space-y-1 px-1">
                    <span className="text-xs text-muted-foreground font-semibold uppercase">Cliente</span>
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      {selectedItem.displayClient.name}
                    </p>
                  </div>
                )}

                {selectedItem.description && (
                  <div className="space-y-1 px-1">
                    <span className="text-xs text-muted-foreground font-semibold uppercase">Descrição</span>
                    <p className="text-sm text-muted-foreground">{selectedItem.description}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Lista do Dia */}
      <Dialog open={isDayModalOpen} onOpenChange={setIsDayModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : ''}
            </DialogTitle>
            <DialogDescription className="text-base">
              {selectedDayItems.length} vencimento{selectedDayItems.length !== 1 ? 's' : ''} nesta data
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-3">
              {selectedDayItems.map((item: any) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setIsDayModalOpen(false);
                    setSelectedItem(item);
                  }}
                  className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent/50 cursor-pointer transition-all group hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full shadow-sm ${item.type === 'tax' ? 'bg-orange-500' :
                      item.type === 'installment' ? 'bg-emerald-500' :
                        'bg-blue-500'
                      }`} />
                    <div>
                      <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {item.displayTitle}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {item.displayClient?.name}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
