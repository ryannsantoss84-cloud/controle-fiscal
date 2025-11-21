
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInstallments } from "@/hooks/useInstallments";
import { useDeadlines } from "@/hooks/useDeadlines";
import { InstallmentCard } from "@/components/installments/InstallmentCard";
import { InstallmentForm } from "@/components/forms/InstallmentForm";
import { Search, Plus } from "lucide-react";

export default function Installments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const { installments, isLoading } = useInstallments();
  const { deadlines } = useDeadlines();

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

  const filteredInstallments = enrichedInstallments.filter((installment) => {
    const matchesSearch = 
      installment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      installment.protocol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      installment.deadline?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      installment.deadline?.clients?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || installment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: installments.length,
    pending: installments.filter(i => i.status === "pending").length,
    completed: installments.filter(i => i.status === "paid" || i.status === "completed").length,
    overdue: installments.filter(i => i.status === "overdue").length,
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Parcelamentos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todas as parcelas de seus prazos
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Parcela
        </Button>
      </div>

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

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
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
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="overdue">Atrasado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredInstallments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhuma parcela encontrada
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredInstallments.map((installment) => (
                <InstallmentCard key={installment.id} installment={installment} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
