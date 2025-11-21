import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";

type Status = "pending" | "in_progress" | "completed" | "overdue" | "paid";

interface StatusBadgeProps {
  status: Status;
  variant?: "default" | "compact";
}

export function StatusBadge({ status, variant = "default" }: StatusBadgeProps) {
  const effectiveStatus = status === "paid" ? "completed" : status;

  const config = {
    pending: {
      label: "Pendente",
      icon: Clock,
      className: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700",
    },
    in_progress: {
      label: "Em Andamento",
      icon: Loader2,
      className: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700",
    },
    completed: {
      label: "Concluído",
      icon: CheckCircle2,
      className: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700",
    },
    overdue: {
      label: "Atrasado",
      icon: AlertCircle,
      className: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700",
    },
  };

  const { label, icon: Icon, className } = config[effectiveStatus];

  if (variant === "compact") {
    return (
      <Badge variant="outline" className={className}>
        {label}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={`gap-1.5 ${className}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Badge>
  );
}
