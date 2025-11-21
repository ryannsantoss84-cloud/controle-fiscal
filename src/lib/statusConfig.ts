import { ObligationStatus } from "@/types";

export const statusConfig: Record<
  ObligationStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    badgeVariant: "default" | "success" | "warning" | "destructive";
  }
> = {
  pending: {
    label: "Pendente",
    color: "text-pending-foreground",
    bgColor: "bg-pending",
    badgeVariant: "default",
  },
  in_progress: {
    label: "Em Andamento",
    color: "text-warning-foreground",
    bgColor: "bg-warning",
    badgeVariant: "warning",
  },
  completed: {
    label: "Concluída",
    color: "text-success-foreground",
    bgColor: "bg-success",
    badgeVariant: "success",
  },
  overdue: {
    label: "Atrasada",
    color: "text-destructive-foreground",
    bgColor: "bg-destructive",
    badgeVariant: "destructive",
  },
};

export const recurrenceLabels: Record<string, string> = {
  none: "Sem repetição",
  monthly: "Mensal",
  quarterly: "Trimestral",
  semiannual: "Semestral",
  annual: "Anual",
};
