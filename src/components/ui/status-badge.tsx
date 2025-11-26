import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type StatusType =
    | "pending"
    | "in_progress"
    | "completed"
    | "overdue"
    | "paid"
    | "active"
    | "inactive"
    | "simples_nacional"
    | "lucro_presumido"
    | "lucro_real"
    | "mei";

interface StatusBadgeProps {
    status: string;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const getStatusConfig = (status: string) => {
        switch (status.toLowerCase()) {
            // Status de Obrigações/Impostos
            case "pending":
                return { label: "Pendente", className: "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 border-blue-500/20" };
            case "in_progress":
                return { label: "Em Andamento", className: "bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20 border-yellow-500/20" };
            case "completed":
                return { label: "Concluído", className: "bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-500/20" };
            case "paid":
                return { label: "Pago", className: "bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-500/20" };
            case "overdue":
                return { label: "Atrasado", className: "bg-red-500/10 text-red-700 hover:bg-red-500/20 border-red-500/20" };

            // Status de Clientes
            case "active":
                return { label: "Ativo", className: "bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-500/20" };
            case "inactive":
                return { label: "Inativo", className: "bg-gray-500/10 text-gray-700 hover:bg-gray-500/20 border-gray-500/20" };

            // Regimes Tributários
            case "simples_nacional":
                return { label: "Simples Nacional", className: "bg-purple-500/10 text-purple-700 hover:bg-purple-500/20 border-purple-500/20" };
            case "lucro_presumido":
                return { label: "Lucro Presumido", className: "bg-indigo-500/10 text-indigo-700 hover:bg-indigo-500/20 border-indigo-500/20" };
            case "lucro_real":
                return { label: "Lucro Real", className: "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 border-blue-500/20" };
            case "mei":
                return { label: "MEI", className: "bg-teal-500/10 text-teal-700 hover:bg-teal-500/20 border-teal-500/20" };

            default:
                return { label: status, className: "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200" };
        }
    };

    const config = getStatusConfig(status);

    return (
        <Badge
            variant="outline"
            className={cn("font-medium border", config.className, className)}
        >
            {config.label}
        </Badge>
    );
}
