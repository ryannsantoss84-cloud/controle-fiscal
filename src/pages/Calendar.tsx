import React, { useState } from "react";
import { format, startOfMonth, endOfMonth, isSameMonth, isToday, addMonths, subMonths, getDay, startOfWeek, endOfWeek, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Receipt, CreditCard, Filter, Plus } from "lucide-react";
import { useDeadlines } from "@/hooks/useDeadlines";
import { useInstallments } from "@/hooks/useInstallments";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { WeekendBadge } from "@/components/shared/WeekendBadge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filter, setFilter] = useState<"all" | "obligation" | "tax" | "installments">("all");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [selectedDayItems, setSelectedDayItems] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { deadlines } = useDeadlines();
  const { installments } = useInstallments();

  const allItems = [
    ...deadlines,
    ...installments.map((i: any) => ({ ...i, type: 'installment' })),
  ];

  const filteredItems = allItems.filter(item => {
    if (filter === "all") return true;
    if (filter === "obligation") return item.type === "obligation";
    if (filter === "tax") return item.type === "tax";
    if (filter === "installments") return item.type === "installment";
    return true;
  });

  const itemsByDate = filteredItems.reduce((acc: any, item: any) => {
    const dueDate = item.due_date;
    if (!dueDate) return acc;

    if (!acc[dueDate]) {
      acc[dueDate] = [];
    }

    let title = "";
    let client = null;

    if (item.type === 'installment') {
      title = `Parcela ${item.installment_number}/${item.total_installments}`;
      if (item.obligations?.title) title += ` - ${item.obligations.title}`;
      client = item.obligations?.clients;
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

  const generateCalendarGrid = () => {
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
  };

  const calendarWeeks = generateCalendarGrid();

  // Contadores
  const counts = {
    obligation: filteredItems.filter(i => i.type === 'obligation').length,
    tax: filteredItems.filter(i => i.type === 'tax').length,
    installment: filteredItems.filter(i => i.type === 'installment').length,
  };

  const handleDayClick = (day: Date, items: any[]) => {
    if (items.length === 1) {
      setSelectedItem(items[0]);
    } else if (items.length > 1) {
      setSelectedDayItems(items);
      setSelectedDate(day);
      setIsDayModalOpen(true);
    } else {
      setSelectedDate(day);
      setIsNewItemModalOpen(true);
    }
  };

  const groupedDayItems = selectedDayItems.reduce((acc, item) => {
    const type = item.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Cabeçalho e Controles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda Fiscal</h1>
          <p className="text-muted-foreground">
            Gestão visual de vencimentos e prazos
          </p>
        </div>

        <div className="flex items-center gap-2 bg-card p-1 rounded-lg border shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="px-4 font-semibold min-w-[140px] text-center">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className="text-xs font-medium"
          >
            Hoje
          </Button>
        </div>
      </div>

      {/* Filtros e Legendas Modernos */}
      <div className="flex flex-wrap gap-2 items-center bg-muted/30 p-1 rounded-xl border border-border/50">
        <div className="flex items-center px-3 text-sm font-medium text-muted-foreground gap-2">
          <Filter className="h-4 w-4" />
          Filtros:
        </div>

        <Button
          variant={filter === 'all' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('all')}
          className="rounded-lg text-xs h-8"
        >
          Todos
          <Badge variant="secondary" className="ml-2 bg-background/50 text-[10px] h-5 px-1.5">{allItems.length}</Badge>
        </Button>

        <Button
          variant={filter === 'obligation' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('obligation')}
          className={`rounded-lg text-xs h-8 ${filter === 'obligation' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : ''}`}
        >
          <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
          Obrigações
          <span className="ml-2 opacity-60">{counts.obligation}</span>
        </Button>

        <Button
          variant={filter === 'tax' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('tax')}
          className={`rounded-lg text-xs h-8 ${filter === 'tax' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' : ''}`}
        >
          <div className="w-2 h-2 rounded-full bg-orange-500 mr-2" />
          Impostos
          <span className="ml-2 opacity-60">{counts.tax}</span>
        </Button>

        <Button
          variant={filter === 'installments' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('installments')}
          className={`rounded-lg text-xs h-8 ${filter === 'installments' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : ''}`}
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
          Parcelamentos
          <span className="ml-2 opacity-60">{counts.installment}</span>
        </Button>
      </div>

      {/* Grid do Calendário */}
      <Card className="border-border shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardContent className="p-0">
          {/* Cabeçalho dos Dias */}
          <div className="grid grid-cols-7 border-b bg-muted/30">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
              <div
                key={day}
                className="py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

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
                        bg-card hover:bg-accent/5
                        ${!isCurrentMonth ? "bg-muted/10 text-muted-foreground" : ""}
                        ${isWeekend ? "bg-muted/5" : ""}
                      `}
                    >
                      {/* Número do Dia */}
                      <div className="flex justify-between items-start mb-2">
                        <span
                          className={`
                            text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full transition-colors
                            ${isCurrentDay
                              ? "bg-primary text-primary-foreground shadow-md scale-110"
                              : "text-muted-foreground group-hover:text-foreground group-hover:bg-muted"
                            }
                            ${!isCurrentMonth ? "opacity-50" : ""}
                          `}
                        >
                          {format(day, "d")}
                        </span>

                        {/* Botão Add (Hover) */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus className="h-4 w-4 text-muted-foreground hover:text-primary" />
                        </div>
                      </div>

                      {/* Lista de Itens */}
                      <div className="space-y-1.5">
                        {items.slice(0, 3).map((item: any) => {
                          // Cores baseadas no tipo
                          let colorClass = "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"; // Padrão
                          if (item.type === 'tax') colorClass = "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20 hover:bg-orange-500/20";
                          if (item.type === 'installment') colorClass = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20";

                          // Status Check
                          const isCompleted = item.status === 'completed' || item.status === 'paid';
                          const isOverdue = item.status === 'overdue';

                          return (
                            <div
                              key={item.id}
                              className={`
                                text-[10px] px-1.5 py-1 rounded-md border truncate transition-all
                                ${colorClass}
                                ${isCompleted ? "opacity-60 line-through decoration-current" : ""}
                                ${isOverdue ? "border-red-500/50 bg-red-500/5 text-red-600" : ""}
                              `}
                              title={item.displayTitle}
                            >
                              <div className="flex items-center gap-1">
                                <div className={`w-1 h-1 rounded-full ${isOverdue ? 'bg-red-500' : 'bg-current'}`} />
                                <span className="truncate font-medium">{item.displayTitle}</span>
                              </div>
                            </div>
                          );
                        })}

                        {items.length > 3 && (
                          <div className="text-[10px] font-medium text-muted-foreground pl-1">
                            +{items.length - 3} mais...
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

      {/* --- Modais (Mantidos e Estilizados) --- */}

      {/* Modal de Detalhes */}
      <Dialog open={!!selectedItem && !isDayModalOpen} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-md">
          {selectedItem ? (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${selectedItem.type === 'tax' ? 'bg-orange-100 text-orange-600' :
                      selectedItem.type === 'installment' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-blue-100 text-blue-600'
                    }`}>
                    {selectedItem.type === 'obligation' && <CalendarIcon className="h-5 w-5" />}
                    {selectedItem.type === 'tax' && <Receipt className="h-5 w-5" />}
                    {selectedItem.type === 'installment' && <CreditCard className="h-5 w-5" />}
                  </div>
                  <div>
                    <DialogTitle className="text-lg">{selectedItem.displayTitle}</DialogTitle>
                    <DialogDescription className="text-xs uppercase tracking-wider font-medium mt-0.5">
                      {selectedItem.type === 'obligation' ? 'Obrigação Fiscal' :
                        selectedItem.type === 'tax' ? 'Imposto' : 'Parcelamento'}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl border border-border/50">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground font-medium uppercase">Status</span>
                    <StatusBadge status={selectedItem.status} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground font-medium uppercase">Vencimento</span>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">
                        {format(new Date(selectedItem.due_date), "dd/MM/yyyy")}
                      </span>
                      <WeekendBadge dueDate={selectedItem.due_date} originalDate={selectedItem.original_due_date} />
                    </div>
                  </div>
                </div>

                {selectedItem.displayClient && (
                  <div className="space-y-1 px-1">
                    <span className="text-xs text-muted-foreground font-medium uppercase">Cliente</span>
                    <p className="text-sm font-medium">{selectedItem.displayClient.name}</p>
                  </div>
                )}

                {selectedItem.description && (
                  <div className="space-y-1 px-1">
                    <span className="text-xs text-muted-foreground font-medium uppercase">Descrição</span>
                    <p className="text-sm text-muted-foreground">{selectedItem.description}</p>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Modal de Lista do Dia */}
      <Dialog open={isDayModalOpen} onOpenChange={setIsDayModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : ''}
            </DialogTitle>
            <DialogDescription>
              {selectedDayItems.length} vencimentos nesta data
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              {selectedDayItems.map((item: any) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setIsDayModalOpen(false);
                    setSelectedItem(item);
                  }}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${item.type === 'tax' ? 'bg-orange-500' :
                        item.type === 'installment' ? 'bg-emerald-500' :
                          'bg-blue-500'
                      }`} />
                    <div>
                      <p className="font-medium text-sm group-hover:text-primary transition-colors">{item.displayTitle}</p>
                      <p className="text-xs text-muted-foreground">{item.displayClient?.name}</p>
                    </div>
                  </div>
                  <StatusBadge status={item.status} variant="compact" />
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Modal Novo Item */}
      <Dialog open={isNewItemModalOpen} onOpenChange={setIsNewItemModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Adicionar Novo</DialogTitle>
            <DialogDescription>
              O que você deseja agendar para {selectedDate ? format(selectedDate, "dd/MM") : ''}?
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <Link
              to={`/deadlines/new?due_date=${selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}&type=obligation`}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border bg-card hover:bg-primary/5 hover:border-primary/50 transition-all cursor-pointer group"
            >
              <div className="p-2 rounded-full bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">Obrigação</span>
            </Link>
            <Link
              to={`/deadlines/new?due_date=${selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}&type=tax`}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border bg-card hover:bg-primary/5 hover:border-primary/50 transition-all cursor-pointer group"
            >
              <div className="p-2 rounded-full bg-orange-100 text-orange-600 group-hover:scale-110 transition-transform">
                <Receipt className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">Imposto</span>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
