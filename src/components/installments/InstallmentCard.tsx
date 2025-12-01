import { useState } from "react";
import { CalendarIcon, Building2, AlertTriangle, CheckCircle2, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { isWeekend, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useInstallments } from "@/hooks/useInstallments";
import { useToast } from "@/hooks/use-toast";
import { InstallmentEditForm } from "@/components/forms/InstallmentEditForm";
import { DeleteConfirmation } from "@/components/shared/DeleteConfirmation";
import { formatDate } from "@/lib/utils";
import { TimeTracker } from "@/components/shared/TimeTracker";

interface InstallmentCardProps {
  installment: any;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

const statusConfig = {
  pending: { label: "Pendente", variant: "secondary" as const },
  paid: { label: "Concluído", variant: "default" as const },
  overdue: { label: "Atrasado", variant: "destructive" as const },
  completed: { label: "Concluído", variant: "default" as const },
};

export function InstallmentCard({ installment, isSelected, onToggleSelect }: InstallmentCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const config = statusConfig[installment.status as keyof typeof statusConfig] || statusConfig.pending;
  const { updateInstallment, deleteInstallment } = useInstallments();
  const { toast } = useToast();
  const isWeekendDue = isWeekend(new Date(installment.due_date));
  const isOverdue = isPast(new Date(installment.due_date)) && installment.status === "pending";

  const handleStatusChange = async (newStatus: "pending" | "paid" | "overdue") => {
    try {
      await updateInstallment.mutateAsync({
        id: installment.id,
        status: newStatus,
        paid_at: newStatus === "paid" ? new Date().toISOString() : null,
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar status",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteInstallment.mutateAsync(installment.id);
      setShowDeleteDialog(false);
    } catch (error) {
      toast({
        title: "Erro ao excluir parcela",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className={`border-border/40 shadow-sm hover:shadow-md transition-all duration-200 bg-card/50 ${isSelected ? 'ring-2 ring-primary bg-primary/5' : ''}`}>
        <CardHeader className="pb-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3">
              {onToggleSelect && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleSelect(installment.id)}
                  className="mt-1"
                />
              )}
              <div>
                <h3 className="text-base font-medium text-foreground leading-tight">
                  Parcela {installment.installment_number}/{installment.total_installments}
                </h3>
                {installment.obligations?.title && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {installment.obligations.title}
                  </p>
                )}
              </div>
            </div>
            <Badge variant={config.variant}>{config.label}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-2 pb-3">
          {(installment.obligations?.clients || installment.clients) && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{installment.obligations?.clients?.name || installment.clients?.name}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <span>
                Vencimento: {formatDate(installment.due_date)}
              </span>
              {isWeekendDue && (
                <div className="flex items-center gap-1 text-warning" title="Vence no final de semana">
                  <AlertTriangle className="h-3 w-3" />
                </div>
              )}
            </div>
          </div>

          {installment.paid_at && (
            <div className="flex items-center gap-2 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                Pago em {formatDate(installment.paid_at)}
              </span>
            </div>
          )}

          {isOverdue && (
            <div className="flex items-center gap-2 text-sm text-destructive font-medium">
              <AlertTriangle className="h-4 w-4" />
              <span>Parcela atrasada!</span>
            </div>
          )}

          {/* Controle de Tempo */}
          <TimeTracker
            createdAt={installment.created_at}
            completedAt={installment.paid_at}
            timeSpentMinutes={installment.time_to_payment_minutes}
            status={installment.status}
            compact
          />
        </CardContent>

        <CardFooter className="pt-3 border-t flex gap-2">
          {installment.status === "pending" && (
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={() => handleStatusChange("paid")}
              disabled={updateInstallment.isPending}
            >
              Marcar como Concluído
            </Button>
          )}
          {(installment.status === "paid" || installment.status === "completed") && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => handleStatusChange("pending")}
              disabled={updateInstallment.isPending}
            >
              Reverter para Pendente
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEditDialog(true)}
          >
            <Edit className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <InstallmentEditForm
        installment={installment}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onUpdate={async (id, data) => {
          await updateInstallment.mutateAsync({ id, ...data });
        }}
        onSuccess={() => {
          setShowEditDialog(false);
          toast({
            title: "Parcela atualizada",
            description: "As alterações foram salvas com sucesso.",
          });
        }}
      />

      <DeleteConfirmation
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        itemName={`Parcela ${installment.installment_number}/${installment.total_installments}`}
        clientName={installment.obligations?.clients?.name || installment.clients?.name}
        dueDate={formatDate(installment.due_date)}
      />
    </>
  );
}