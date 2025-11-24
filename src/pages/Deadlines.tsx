
import { useState, useMemo } from "react";
import { useDeadlines } from "@/hooks/useDeadlines";
import { useClients } from "@/hooks/useClients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DeadlineCard } from "@/components/deadlines/DeadlineCard";
import { DeadlineTable } from "@/components/deadlines/DeadlineTable";
import { DeadlineForm } from "@/components/forms/DeadlineForm";
import { RefreshCw, Trash2, CheckCircle2, RotateCcw, Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { FilterBar } from "@/components/layout/FilterBar";
import { useSorting } from "@/hooks/useSorting";
import { Deadline } from "@/hooks/useDeadlines";

export default function Deadlines() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState("");
  const [clientFilter, setClientFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [targetDate, setTargetDate] = useState<Date>(new Date());
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  const { deadlines, deleteDeadline, updateDeadline } = useDeadlines();
  const { clients } = useClients();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { sortConfig, handleSort, sortData } = useSorting<Deadline>('due_date');

  // Filtragem
  const filteredDeadlines = useMemo(() => {
    const filtered = deadlines.filter((deadline) => {
      const matchesSearch = deadline.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deadline.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClient = clientFilter === "all" || deadline.client_id === clientFilter;
      const matchesStatus = statusFilter === "all" || deadline.status === statusFilter;

      return matchesSearch && matchesClient && matchesStatus;
    });

    return sortData(filtered);
  }, [deadlines, searchTerm, clientFilter, statusFilter, sortData]);

  // Paginação
  const totalPages = Math.ceil(filteredDeadlines.length / itemsPerPage);
  const paginatedDeadlines = filteredDeadlines.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredDeadlines.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredDeadlines.map(d => d.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir ${selectedIds.size} itens?`)) return;

    try {
      for (const id of selectedIds) {
        await deleteDeadline.mutateAsync(id);
      }
      setSelectedIds(new Set());
      toast({ title: "Itens excluídos com sucesso!" });
    } catch (error) {
      toast({ title: "Erro ao excluir prazos", variant: "destructive" });
    }
  };

  const handleBulkComplete = async () => {
    try {
      await Promise.all(Array.from(selectedIds).map(id =>
        updateDeadline.mutateAsync({
          id,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
      ));
      setSelectedIds(new Set());
      toast({ title: "Itens concluídos com sucesso!" });
    } catch (error) {
      toast({ title: "Erro ao concluir prazos", variant: "destructive" });
    }
  };

  const handleBulkReopen = async () => {
    try {
      await Promise.all(Array.from(selectedIds).map(id =>
        updateDeadline.mutateAsync({
          id,
          status: 'pending',
          completed_at: null
        })
      ));
      setSelectedIds(new Set());
      toast({ title: "Itens reabertos com sucesso!" });
    } catch (error) {
      toast({ title: "Erro ao reabrir prazos", variant: "destructive" });
    }
  };

  const handleGenerateMonthly = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await (supabase.rpc as any)('generate_monthly_obligations', {
        target_date: targetDate.toISOString().split('T')[0]
      });

      if (error) throw error;
      const result = data as any;
      toast({
        title: "Automação Concluída",
        description: `${result.obligations_created} novas obrigações geradas para ${format(targetDate, 'MMMM/yyyy', { locale: ptBR })}.`
      });
      queryClient.invalidateQueries({ queryKey: ["deadlines"] });
    } catch (error: any) {
      toast({ title: "Erro na automação", description: error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const totalCount = filteredDeadlines.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Prazos Fiscais"
        description={`Gerencie obrigações e impostos (${totalCount} registros)`}
        actions={
          <>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !targetDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {targetDate ? format(targetDate, "MMMM 'de' yyyy", { locale: ptBR }) : <span>Escolha o mês</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={targetDate}
                    onSelect={(date) => date && setTargetDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Button
                onClick={handleGenerateMonthly}
                disabled={isGenerating}
                variant="secondary"
                className="gap-2 shadow-sm whitespace-nowrap"
              >
                <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? "Gerando..." : "Gerar"}
              </Button>
            </div>
            <DeadlineForm />
          </>
        }
      />

      <FilterBar viewMode={viewMode} onViewModeChange={setViewMode}>
        <Input
          placeholder="Buscar por título..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          className="flex-1"
        />
        <Select value={clientFilter} onValueChange={(v) => { setClientFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os clientes</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="in_progress">Em Andamento</SelectItem>
            <SelectItem value="completed">Concluída</SelectItem>
            <SelectItem value="overdue">Atrasada</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>

      {selectedIds.size > 0 && (
        <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg flex items-center justify-between animate-in slide-in-from-top-2">
          <span className="text-sm font-medium text-primary">
            {selectedIds.size} item(s) selecionado(s)
          </span>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm" className="gap-2">
                  Ações em Massa <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleBulkComplete} className="gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Concluir Selecionados
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleBulkReopen} className="gap-2">
                  <RotateCcw className="h-4 w-4 text-warning" />
                  Reabrir Selecionados
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleBulkDelete} className="gap-2 text-destructive focus:text-destructive">
                  <Trash2 className="h-4 w-4" />
                  Excluir Selecionados
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedDeadlines.map((deadline) => (
            <DeadlineCard
              key={deadline.id}
              deadline={deadline}
              isSelected={selectedIds.has(deadline.id)}
              onToggleSelect={handleToggleSelect}
            />
          ))}
        </div>
      ) : (
        <DeadlineTable
          deadlines={paginatedDeadlines}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          sortConfig={sortConfig}
          onSort={handleSort}
          totalFilteredCount={filteredDeadlines.length}
        />
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <span className="flex items-center px-4 text-sm font-medium">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
