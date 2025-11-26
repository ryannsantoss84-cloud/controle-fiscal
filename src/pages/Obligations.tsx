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
import { DeadlineCard } from "@/components/deadlines/DeadlineCard";
import { DeadlineTable } from "@/components/deadlines/DeadlineTable";
import { DeadlineForm } from "@/components/forms/DeadlineForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { FilterBar } from "@/components/layout/FilterBar";
import { useSorting } from "@/hooks/useSorting";
import { Deadline } from "@/hooks/useDeadlines";
import { useBulkActions } from "@/hooks/useBulkActions";
import { BulkActionBar } from "@/components/shared/BulkActionBar";

export default function Obligations() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState("");
    const [clientFilter, setClientFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);
    const itemsPerPage = 12;

    // Filter by type = 'obligation'
    const { deadlines, deleteDeadline, updateDeadline } = useDeadlines({ typeFilter: 'obligation' });
    const { clients } = useClients();
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

    // Bulk Actions Hook
    const {
        selectedIds,
        handleToggleSelect,
        handleSelectAll,
        clearSelection,
        executeBulkAction,
        selectedCount
    } = useBulkActions({ items: filteredDeadlines });

    const handleBulkDelete = () => executeBulkAction(
        async (ids) => {
            for (const id of ids) {
                await deleteDeadline.mutateAsync(id);
            }
        },
        "Obrigações excluídas com sucesso!",
        "Erro ao excluir obrigações",
        `Tem certeza que deseja excluir ${selectedCount} obrigações?`
    );

    const handleBulkComplete = () => executeBulkAction(
        async (ids) => {
            await Promise.all(ids.map(id =>
                updateDeadline.mutateAsync({
                    id,
                    status: 'completed',
                    completed_at: new Date().toISOString()
                })
            ));
        },
        "Obrigações concluídas com sucesso!",
        "Erro ao concluir obrigações"
    );

    const handleBulkReopen = () => executeBulkAction(
        async (ids) => {
            await Promise.all(ids.map(id =>
                updateDeadline.mutateAsync({
                    id,
                    status: 'pending',
                    completed_at: null
                })
            ));
        },
        "Obrigações reabertas com sucesso!",
        "Erro ao reabrir obrigações"
    );

    // Paginação
    const totalPages = Math.ceil(filteredDeadlines.length / itemsPerPage);
    const paginatedDeadlines = filteredDeadlines.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    const totalCount = filteredDeadlines.length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <PageHeader
                title="Obrigações"
                description={`Gerencie suas obrigações acessórias (${totalCount} registros)`}
                actions={<DeadlineForm />}
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

            <BulkActionBar
                selectedCount={selectedCount}
                onClearSelection={clearSelection}
                onDelete={handleBulkDelete}
                onComplete={handleBulkComplete}
                onReopen={handleBulkReopen}
            />

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
