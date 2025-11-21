
import { CheckCircle2, Edit, Trash2, User, FileText } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { WeekendBadge } from "@/components/shared/WeekendBadge";
import { useDeadlines } from "@/hooks/useDeadlines";
import { format, parseISO, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TaxCardProps {
  tax: any;
  onEdit?: (tax: any) => void;
}

export function TaxCard({ tax, onEdit }: TaxCardProps) {
  const { updateDeadline, deleteDeadline } = useDeadlines();
  const dueDate = parseISO(tax.due_date);
  const isOverdue = isPast(dueDate) && tax.status === "pending";

  const handleMarkAsCompleted = async () => {
    await updateDeadline.mutateAsync({
      id: tax.id,
      status: "completed" as const,
      completed_at: new Date().toISOString(),
    });
  };

  const handleMarkAsPending = async () => {
    await updateDeadline.mutateAsync({
      id: tax.id,
      status: "pending" as const,
      completed_at: undefined,
    });
  };

  const handleDelete = async () => {
    if (confirm("Deseja realmente excluir este imposto?")) {
      await deleteDeadline.mutateAsync(tax.id);
    }
  };

  const recurrenceLabels: Record<string, string> = {
    none: "Único",
    monthly: "Mensal",
    quarterly: "Trimestral",
    semiannual: "Semestral",
    annual: "Anual",
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col space-y-1.5 p-6 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{tax.title}</h3>
            {tax.clients && (
              <p className="text-sm text-muted-foreground truncate">
                {tax.clients.name}
              </p>
            )}
          </div>
          <StatusBadge status={isOverdue ? "overdue" : tax.status} />
        </div>
      </div>

      <div className="p-6 pt-0 space-y-3">
        <div className="space-y-1.5 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Vencimento:</span>
            <span className="font-medium">
              {format(dueDate, "dd/MM/yyyy", { locale: ptBR })}
            </span>
          </div>

          {tax.original_due_date && tax.original_due_date !== tax.due_date && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Data original:</span>
              <span className="text-xs">
                {format(parseISO(tax.original_due_date), "dd/MM/yyyy")}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <WeekendBadge dueDate={tax.due_date} originalDate={tax.original_due_date} />
            {tax.recurrence !== "none" && (
              <span className="text-xs px-2 py-0.5 bg-secondary rounded-full">
                🔁 {recurrenceLabels[tax.recurrence]}
              </span>
            )}
          </div>
        </div>

        {tax.responsible && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{tax.responsible}</span>
          </div>
        )}

        {tax.description && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4 mt-0.5" />
            <span className="line-clamp-2">{tax.description}</span>
          </div>
        )}

        <div className="pt-2 border-t">
          <div className="flex gap-2">
            {tax.status === "pending" ? (
            <button
              onClick={handleMarkAsCompleted}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 flex-1"
              disabled={updateDeadline.isPending}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Marcar como Concluído
            </button>
          ) : (
            <button
              onClick={handleMarkAsPending}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 flex-1"
              disabled={updateDeadline.isPending}
            >
              Marcar como Pendente
            </button>
          )}

          <button
            onClick={() => onEdit?.(tax)}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
            disabled={updateDeadline.isPending}
          >
            <Edit className="h-4 w-4" />
          </button>

          <button
            onClick={handleDelete}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
            disabled={deleteDeadline.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
