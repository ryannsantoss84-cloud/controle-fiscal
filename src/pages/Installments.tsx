
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInstallments } from "@/hooks/useInstallments";
import { useDeadlines } from "@/hooks/useDeadlines";
import { useClients } from "@/hooks/useClients";
import { InstallmentCard } from "@/components/installments/InstallmentCard";
import { InstallmentTable } from "@/components/installments/InstallmentTable";
import { InstallmentForm } from "@/components/forms/InstallmentForm";
import { Search, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { FilterBar } from "@/components/layout/FilterBar";
import { useSorting } from "@/hooks/useSorting";
import { useBulkActions } from "@/hooks/useBulkActions";
import { BulkActionBar } from "@/components/shared/BulkActionBar";

export default function Installments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [formOpen, setFormOpen] = useState(false);

  const { installments, isLoading, deleteInstallment, updateInstallment } = useInstallments();
  const { deadlines } = useDeadlines();
  const { clients } = useClients({ pageSize: 100 });
  const { sortConfig, handleSort, sortData } = useSorting<any>('due_date');

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  // Enriquecer parcelas com dados da obrigação
  const enrichedInstallments = installments.map(installment => {
    const deadline = deadlines.find(o => o.id === installment.obligation_id);
    return {
      ...installment,
      deadline
    };
  });

  const filteredInstallments = useMemo(() => {
    const filtered = enrichedInstallments.filter((installment) => {
      const matchesSearch =
        installment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        installment.protocol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        installment.deadline?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        installment.deadline?.clients?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        installment.clients?.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || installment.status === statusFilter;

      const matchesClient = clientFilter === "all" ||
        installment.deadline?.client_id === clientFilter ||
        installment.client_id === clientFilter;

      return matchesSearch && matchesStatus && matchesClient;
    });

    return sortData(filtered);
  }, [enrichedInstallments, searchTerm, statusFilter, clientFilter, sortData]);

  // Bulk Actions Hook
  const {
    selectedIds,
    handleToggleSelect,
    handleSelectAll,
    clearSelection,
    executeBulkAction,
    selectedCount
  } = useBulkActions({ items: filteredInstallments });

  const handleBulkDelete = () => executeBulkAction(
    async (ids) => {
      for (const id of ids) {
        await deleteInstallment.mutateAsync(id);
      }
    },
    "Parcelas excluídas com sucesso!",
    "Erro ao excluir parcelas",
    `Tem certeza que deseja excluir ${selectedCount} parcelas?`
  );

  const handleBulkComplete = () => executeBulkAction(
    async (ids) => {
      await Promise.all(ids.map(id =>
        updateInstallment.mutateAsync({
          id,
          status: 'paid',
          paid_at: new Date().toISOString()
        })
      ));
    },
    "Parcelas marcadas como pagas!",
    "Erro ao atualizar parcelas"
  );

  const handleBulkReopen = () => executeBulkAction(
    async (ids) => {
      await Promise.all(ids.map(id =>
        updateInstallment.mutateAsync({
          id,
          status: 'pending',
          paid_at: null
        })
      ));
    },
    "Parcelas reabertas com sucesso!",
    "Erro ao reabrir parcelas"
  );

  const stats = {
    total: installments.length,
    pending: installments.filter(i => i.status === "pending").length,
    completed: installments.filter(i => i.status === "paid" || i.status === "completed").length,
    overdue: installments.filter(i => i.status === "overdue").length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Parcelamentos"
        description="Gerencie todas as parcelas de seus prazos"
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Parcela
          </Button>
        }
      />

      <InstallmentForm open={formOpen} onOpenChange={setFormOpen} />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Parcelas cadastradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pending">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Aguardando pagamento</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Já finalizadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">Requerem atenção</p>
          </CardContent>
        </Card>
      </div>

      <FilterBar viewMode={viewMode} onViewModeChange={setViewMode}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, protocolo, título ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="paid">Pago</SelectItem>
            <SelectItem value="overdue">Atrasado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={clientFilter} onValueChange={setClientFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Clientes</SelectItem>
            {clients?.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBar>

      <BulkActionBar
        selectedCount={selectedCount}
        onClearSelection={clearSelection}
        onDelete={handleBulkDelete}
        onComplete={handleBulkComplete}
        onReopen={handleBulkReopen}
      />

      {filteredInstallments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
          Nenhuma parcela encontrada
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredInstallments.map((installment) => (
            <InstallmentCard
              key={installment.id}
              installment={installment}
              isSelected={selectedIds.has(installment.id)}
              onToggleSelect={handleToggleSelect}
            />
          ))}
        </div>
      ) : (
        <InstallmentTable
          installments={filteredInstallments}
          sortConfig={sortConfig}
          onSort={handleSort}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
        />
      )}
    </div>
  );
}
