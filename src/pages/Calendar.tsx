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
import { formatDate } from "@/lib/utils";

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
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Hoje
            </Button>
          </div>
        </div>

        {/* Filtros e Estatísticas */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filtros */}
          <Card className="lg:col-span-3 border-none shadow-elegant glass-card">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  Filtros:
                </div>

                <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    <SelectItem value="obligation">Obrigações</SelectItem>
                    <SelectItem value="tax">Impostos</SelectItem>
                    <SelectItem value="installments">Parcelamentos</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={clientFilter} onValueChange={setClientFilter}>
                  <SelectTrigger className="w-[180px] h-9">
                    <SelectValue placeholder="Cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Clientes</SelectItem>
                    {clients?.map((client: any) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Status</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="overdue">Atrasado</SelectItem>
                  </SelectContent>
                </Select>

                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 px-2 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4 mr-1" />
                    Limpar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Mini Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-primary/5 border-primary/10 shadow-sm">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold text-primary">{stats.today}</span>
                <span className="text-xs text-muted-foreground font-medium mt-1">Vencem Hoje</span>
              </CardContent>
            </Card>
            <Card className="bg-destructive/5 border-destructive/10 shadow-sm">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold text-destructive">{stats.overdue}</span>
                <span className="text-xs text-muted-foreground font-medium mt-1">Atrasados</span>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Legenda */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground bg-card/50 p-3 rounded-lg border border-border/50 shadow-sm">
          <span className="font-semibold mr-2">Legenda:</span>

          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Obrigação</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>Imposto</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>Parcelamento</span>
          </div>

          <div className="w-px h-4 bg-border mx-2 hidden sm:block" />

          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30" />
            <span>Concluído</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30" />
            <span>Atrasado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500/30" />
            <span>Pendente</span>
          </div>
        </div>
      </div>

      {/* Grid do Calendário */}
      <Card className="border-none shadow-elegant glass-card overflow-hidden">
        <div className="grid grid-cols-7 border-b bg-muted/30">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
            <div key={day} className="p-3 text-center text-sm font-semibold text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 auto-rows-fr bg-card">
          {calendarWeeks.map((week, weekIndex) => (
            <React.Fragment key={weekIndex}>
              {week.map((day, dayIndex) => {
                const dateKey = day.toISOString().split('T')[0];
                const dayItems = itemsByDate[dateKey] || [];
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isTodayDate = isToday(day);
                const isWeekend = getDay(day) === 0 || getDay(day) === 6;

                return (
                  <div
                    key={dayIndex}
                    className={`
                      min-h-[120px] p-2 border-r border-b transition-colors relative group
                      ${!isCurrentMonth
                        ? "bg-slate-100/80 dark:bg-slate-900/80 opacity-60 grayscale-[0.5]"
                        : isWeekend
                          ? "bg-slate-50/80 dark:bg-slate-900/30"
                          : "bg-background"}
                      ${isTodayDate ? "bg-blue-50/50 dark:bg-blue-900/10 ring-1 ring-inset ring-primary/20" : ""}
                      hover:bg-muted/20 cursor-pointer
                    `}
                    onClick={() => handleDayClick(day, dayItems)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`
                          text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                          ${isTodayDate ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground"}
                        `}
                      >
                        {format(day, "d")}
                      </span>
                      {dayItems.length > 0 && (
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                          {dayItems.length}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1">
                      {dayItems.slice(0, 3).map((item: any, index: number) => (
                        <div
                          key={index}
                          className={`
                            text-[10px] px-1.5 py-1 rounded border truncate flex items-center gap-1
                            ${item.status === 'completed' || item.status === 'paid' ? 'bg-green-500/10 text-green-700 border-green-200' :
                              item.status === 'overdue' ? 'bg-red-500/10 text-red-700 border-red-200' :
                                'bg-blue-500/10 text-blue-700 border-blue-200'}
                          `}
                          title={item.displayTitle}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.type === 'tax' ? 'bg-red-500' :
                            item.type === 'installment' ? 'bg-purple-500' : 'bg-blue-500'
                            }`} />
                          {item.displayTitle}
                        </div>
                      ))}
                      {dayItems.length > 3 && (
                        <div className="text-[10px] text-muted-foreground pl-1 font-medium">
                          + {dayItems.length - 3} mais
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </Card>

      {/* Modal de Detalhes do Item */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent>
          {selectedItem && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={
                    selectedItem.type === 'tax' ? 'destructive' :
                      selectedItem.type === 'installment' ? 'secondary' : 'outline'
                  }>
                    {selectedItem.type === 'tax' ? 'Imposto' :
                      selectedItem.type === 'installment' ? 'Parcelamento' : 'Obrigação'}
                  </Badge>
                  {selectedItem.recurrence && selectedItem.recurrence !== 'none' && (
                    <Badge variant="outline" className="text-xs">
                      Recorrente
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-xl">{selectedItem.displayTitle}</DialogTitle>
                <DialogDescription>
                  Detalhes do vencimento selecionado
                </DialogDescription>
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
                      {formatDate(selectedItem.due_date)}
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
                  className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer flex items-center justify-between group"
                  onClick={() => {
                    setSelectedItem(item);
                    setIsDayModalOpen(false);
                  }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.type === 'tax' ? 'bg-red-500' :
                        item.type === 'installment' ? 'bg-purple-500' : 'bg-blue-500'
                        }`} />
                      <span className="font-medium text-sm">{item.displayTitle}</span>
                    </div>
                    {item.displayClient && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1 pl-4">
                        <Building2 className="w-3 h-3" />
                        {item.displayClient.name}
                      </div>
                    )}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <StatusBadge status={item.status} variant="compact" />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
