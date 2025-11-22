import { useState } from "react";
import { CheckCircle, Trash2, RefreshCw, ChevronLeft, ChevronRight, LayoutGrid, List as ListIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeadlineCard } from "@/components/deadlines/DeadlineCard";
import { DeadlineForm } from "@/components/forms/DeadlineForm";
import { useDeadlines, Deadline } from "@/hooks/useDeadlines";
import { useClients } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useSorting } from "@/hooks/useSorting";
import { SortableColumn } from "@/components/shared/SortableColumn";

export default function Deadlines() {
  // Estados de Filtro e Paginação
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const pageSize = viewMode === 'grid' ? 12 : 20;

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);

  const { sortConfig, handleSort, sortData } = useSorting<Deadline>('due_date');

  // Hook com Paginação e Filtros no Backend
  const { deadlines: dataDeadlines, totalCount, isLoading, updateDeadline, deleteDeadline } = useDeadlines({
    page,
    pageSize,
    searchTerm,
    statusFilter,
    typeFilter,
    clientFilter
  });

  const deadlines = sortData(dataDeadlines || []);

  const { clients } = useClients({ pageSize: 100 });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const totalPages = Math.ceil(totalCount / pageSize);

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === deadlines.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(deadlines.map(d => d.id)));
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    try {
      const count = selectedIds.size;
      for (const id of selectedIds) {
        await updateDeadline.mutateAsync({
          id,
          status: newStatus as any,
          completed_at: newStatus === "completed" ? new Date().toISOString() : null,
        });
      }
      setSelectedIds(new Set());
      toast({ title: "Status atualizado com sucesso!" });
    } catch (error) {
      toast({ title: "Erro ao atualizar prazos", variant: "destructive" });
    }
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    if (!confirm(`Tem certeza que deseja excluir ${count} itens?`)) return;

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

  const handleGenerateMonthly = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await (supabase.rpc as any)('generate_monthly_obligations', {
        target_date: new Date().toISOString().split('T')[0]
      });

      if (error) throw error;
      const result = data as any;
      toast({
        title: "Automação Concluída",
        description: `${result.obligations_created} novas obrigações geradas.`
      });
      queryClient.invalidateQueries({ queryKey: ["deadlines"] });
    } catch (error: any) {
      toast({ title: "Erro na automação", description: error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text-primary">Prazos Fiscais</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie obrigações e impostos ({totalCount} registros)
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleGenerateMonthly}
            disabled={isGenerating}
            variant="secondary"
            className="gap-2 shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? "Gerando..." : "Gerar Mensal"}
          </Button>
          <DeadlineForm />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-xl border shadow-sm items-center">
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

        {/* View Toggle */}
        <div className="flex items-center border rounded-md bg-muted/50 p-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('list')}
          >
            <ListIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-20 z-20 bg-primary/5 backdrop-blur-md border border-primary/20 rounded-xl p-4 shadow-lg animate-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={deadlines.length > 0 && selectedIds.size === deadlines.length}
                onCheckedChange={toggleSelectAll}
                className="border-primary"
              />
              <div>
                <span className="font-semibold text-lg text-primary">
                  {selectedIds.size} selecionados
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" onClick={() => handleBulkStatusChange("pending")} className="gap-2 border-blue-500/50 hover:bg-blue-500/10">
                <CheckCircle className="h-4 w-4 text-blue-500" /> Pendente
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkStatusChange("in_progress")} className="gap-2 border-yellow-500/50 hover:bg-yellow-500/10">
                <CheckCircle className="h-4 w-4 text-yellow-500" /> Andamento
              </Button>
              <Button variant="default" size="sm" onClick={() => handleBulkStatusChange("completed")} className="gap-2 bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4" /> Concluir
              </Button>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="gap-2">
                <Trash2 className="h-4 w-4" /> Excluir
              </Button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {deadlines.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-muted/10 rounded-xl border border-dashed">
              <p className="text-muted-foreground">Nenhum prazo encontrado</p>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {deadlines.map((deadline) => (
                    <DeadlineCard
                      key={deadline.id}
                      deadline={deadline}
                      isSelected={selectedIds.has(deadline.id)}
                      onToggleSelect={toggleSelection}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                  <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_auto_auto] gap-4 p-4 border-b bg-muted/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <div className="w-8 text-center">
                      <Checkbox
                        checked={deadlines.length > 0 && selectedIds.size === deadlines.length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </div>
                    <SortableColumn
                      label="Título"
                      sortKey="title"
                      currentSortKey={sortConfig.key as string}
                      currentSortDirection={sortConfig.direction}
                      onSort={handleSort}
                    />
                    <SortableColumn
                      label="Cliente"
                      sortKey="clients.name"
                      currentSortKey={sortConfig.key as string}
                      currentSortDirection={sortConfig.direction}
                      onSort={handleSort}
                    />
                    <SortableColumn
                      label="Competência"
                      sortKey="reference_date"
                      currentSortKey={sortConfig.key as string}
                      currentSortDirection={sortConfig.direction}
                      onSort={handleSort}
                    />
                    <SortableColumn
                      label="Vencimento"
                      sortKey="due_date"
                      currentSortKey={sortConfig.key as string}
                      currentSortDirection={sortConfig.direction}
                      onSort={handleSort}
                    />
                    <SortableColumn
                      label="Status"
                      sortKey="status"
                      currentSortKey={sortConfig.key as string}
                      currentSortDirection={sortConfig.direction}
                      onSort={handleSort}
                    />
                    <div className="text-right">Ações</div>
                  </div>
                  <div className="divide-y">
                    {deadlines.map((deadline) => (
                      <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_auto_auto] gap-4 p-4 items-center hover:bg-muted/5 transition-colors ${selectedIds.has(deadline.id) ? 'bg-primary/5' : ''}">
                        <div className="w-8 text-center">
                          <Checkbox
                            checked={selectedIds.has(deadline.id)}
                            onCheckedChange={() => toggleSelection(deadline.id)}
                          />
                        </div>
                        <div className="font-medium text-sm">{deadline.title}</div>
                        <div className="text-sm text-muted-foreground">{deadline.clients?.name}</div>
                        <div className="text-sm font-mono">
                          {deadline.reference_date
                            ? format(new Date(deadline.reference_date), "MMM/yyyy", { locale: ptBR })
                            : '-'}
                        </div>
                        <div className="text-sm font-mono">{formatDate(deadline.due_date)}</div>
                        <div><StatusBadge status={deadline.status} variant="compact" /></div>
                        <div className="text-right">
                          {/* Ações simplificadas para lista */}
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleSelection(deadline.id)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 pb-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <span className="text-sm font-medium mx-4">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Próximo
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
