import { Button } from "@/components/ui/button";
import { Plus, Users, FileText, DollarSign, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function QuickActions() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const actions = [
        {
            label: "Novo Cliente",
            icon: Users,
            onClick: () => navigate("/clients"), // Ideally this would open a modal, but for now navigating is safe
            color: "text-blue-600",
            bg: "bg-blue-100",
            border: "border-blue-200"
        },
        {
            label: "Nova Obrigação",
            icon: FileText,
            onClick: () => navigate("/obligations"),
            color: "text-purple-600",
            bg: "bg-purple-100",
            border: "border-purple-200"
        },
        {
            label: "Novo Imposto",
            icon: DollarSign,
            onClick: () => navigate("/taxes"),
            color: "text-green-600",
            bg: "bg-green-100",
            border: "border-green-200"
        },
        {
            label: "Novo Prazo",
            icon: Calendar,
            onClick: () => navigate("/deadlines"),
            color: "text-orange-600",
            bg: "bg-orange-100",
            border: "border-orange-200"
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {actions.map((action, index) => (
                <Button
                    key={index}
                    variant="outline"
                    className={`h-auto py-4 flex flex-col gap-2 hover:bg-muted/50 border-2 ${action.border} hover:border-primary/50 transition-all duration-200`}
                    onClick={action.onClick}
                >
                    <div className={`p-3 rounded-full ${action.bg}`}>
                        <action.icon className={`h-6 w-6 ${action.color}`} />
                    </div>
                    <span className="font-semibold text-foreground">{action.label}</span>
                </Button>
            ))}
        </div>
    );
}
