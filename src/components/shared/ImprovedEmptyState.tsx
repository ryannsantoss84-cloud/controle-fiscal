import { Button } from "@/components/ui/button";
import { FileQuestion, PlusCircle, Search } from "lucide-react";

interface EmptyStateProps {
    icon?: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
}

/**
 * Componente de estado vazio melhorado
 * Mostra mensagem clara quando não há dados e sugere ação
 */
export function ImprovedEmptyState({
    icon: Icon = FileQuestion,
    title,
    description,
    action,
    secondaryAction
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="p-4 rounded-full bg-muted/50 mb-4">
                <Icon className="h-12 w-12 text-muted-foreground" />
            </div>

            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-6">
                {description}
            </p>

            <div className="flex gap-3">
                {action && (
                    <Button onClick={action.onClick} className="gap-2">
                        <PlusCircle className="h-4 w-4" />
                        {action.label}
                    </Button>
                )}
                {secondaryAction && (
                    <Button onClick={secondaryAction.onClick} variant="outline" className="gap-2">
                        <Search className="h-4 w-4" />
                        {secondaryAction.label}
                    </Button>
                )}
            </div>
        </div>
    );
}
