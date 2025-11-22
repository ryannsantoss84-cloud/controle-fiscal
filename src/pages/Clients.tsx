import { useState } from "react";
import { Search, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, LayoutGrid, List as ListIcon, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClientForm } from "@/components/forms/ClientForm";
import { useClients, Client } from "@/hooks/useClients";
import { ClientDetailsDialog } from "@/components/clients/ClientDetailsDialog";
import { ClientEditDialog } from "@/components/clients/ClientEditDialog";
import { DeleteConfirmation } from "@/components/shared/DeleteConfirmation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSorting } from "@/hooks/useSorting";
import { SortableColumn } from "@/components/shared/SortableColumn";

export default function Clients() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const pageSize = viewMode === 'grid' ? 9 : 15;

  const [searchTerm, setSearchTerm] = useState("");
  const [regimeFilter, setRegimeFilter] = useState<string>("all");

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { sortConfig, handleSort, sortData } = useSorting<Client>('name');

  const { clients, totalCount, isLoading, deleteClient } = useClients({
    page,
    pageSize,
    searchTerm
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  const filteredClients = sortData(clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.cnpj.includes(searchTerm) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRegime = regimeFilter === "all" || client.tax_regime === regimeFilter;

    return matchesSearch && matchesRegime;
  }));

  const handleViewDetails = (client: Client) => {
    setSelectedClient(client);
    setDetailsOpen(true);
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setEditOpen(true);
  };

  const handleDeleteClick = (client: Client) => {
    setSelectedClient(client);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedClient) {
      await deleteClient.mutateAsync(selectedClient.id);
      setDeleteOpen(false);
      setSelectedClient(null);
    }
  };

  const taxRegimeLabels: Record<string, string> = {
    simples_nacional: "Simples Nacional",
    lucro_presumido: "Lucro Presumido",
    lucro_real: "Lucro Real",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text-primary">Clientes</h1>
          <p className="text-muted-foreground mt-1">
            Base de clientes ({totalCount} registros)
          </p>
        </div>
        <ClientForm />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-xl border shadow-sm items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CNPJ ou email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select value={regimeFilter} onValueChange={setRegimeFilter}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Filtrar por regime" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os regimes</SelectItem>
            <SelectItem value="simples_nacional">Simples Nacional</SelectItem>
            <SelectItem value="lucro_presumido">Lucro Presumido</SelectItem>
            <SelectItem value="lucro_real">Lucro Real</SelectItem>
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

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {filteredClients.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-muted/10 rounded-xl border border-dashed">
              <p className="text-muted-foreground">
                Nenhum cliente encontrado
              </p>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredClients.map((client) => (
                    <Card key={client.id} className="hover:shadow-md transition-all border-l-4 border-l-transparent hover:border-l-primary">
                      <CardHeader className="space-y-2 pb-3">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-lg truncate pr-2">{client.name}</h3>
                          {client.tax_regime && (
                            <span className="text-[10px] px-2 py-1 rounded-full bg-muted font-medium whitespace-nowrap">
                              {taxRegimeLabels[client.tax_regime]?.split(' ')[0]}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">{client.cnpj}</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                          {client.email && (
                            <p className="text-sm truncate">
                              <span className="text-muted-foreground mr-2">Email:</span>
                              {client.email}
                            </p>
                          )}
                          {client.phone && (
                            <p className="text-sm">
                              <span className="text-muted-foreground mr-2">Tel:</span>
                              {client.phone}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-2 hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                            onClick={() => handleViewDetails(client)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-2 hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                            onClick={() => handleEdit(client)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteClick(client)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                  <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 p-4 border-b bg-muted/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <SortableColumn
                      label="Nome / Documento"
                      sortKey="name"
                      currentSortKey={sortConfig.key as string}
                      currentSortDirection={sortConfig.direction}
                      onSort={handleSort}
                    />
                    <SortableColumn
                      label="Email"
                      sortKey="email"
                      currentSortKey={sortConfig.key as string}
                      currentSortDirection={sortConfig.direction}
                      onSort={handleSort}
                    />
                    <SortableColumn
                      label="Telefone"
                      sortKey="phone"
                      currentSortKey={sortConfig.key as string}
                      currentSortDirection={sortConfig.direction}
                      onSort={handleSort}
                    />
                    <SortableColumn
                      label="Regime"
                      sortKey="tax_regime"
                      currentSortKey={sortConfig.key as string}
                      currentSortDirection={sortConfig.direction}
                      onSort={handleSort}
                    />
                    <div className="text-right">Ações</div>
                  </div>
                  <div className="divide-y">
                    {filteredClients.map((client) => (
                      <div key={client.id} className="grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 p-4 items-center hover:bg-muted/5 transition-colors">
                        <div>
                          <div className="font-medium text-sm">{client.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">{client.cnpj}</div>
                        </div>
                        <div className="text-sm text-muted-foreground truncate">{client.email || '-'}</div>
                        <div className="text-sm text-muted-foreground">{client.phone || '-'}</div>
                        <div>
                          {client.tax_regime && (
                            <span className="text-[10px] px-2 py-1 rounded-full bg-muted font-medium whitespace-nowrap">
                              {taxRegimeLabels[client.tax_regime]?.split(' ')[0]}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewDetails(client)}>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(client)}>
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteClick(client)}>
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
            <div className="flex items-center justify-center gap-2 mt-8">
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

      <ClientDetailsDialog
        client={selectedClient}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      <ClientEditDialog
        client={selectedClient}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <DeleteConfirmation
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title="Excluir Cliente"
        itemName={selectedClient?.name || ""}
      />
    </div>
  );
}
