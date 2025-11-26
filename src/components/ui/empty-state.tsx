import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description: string;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg bg-muted/10 animate-in fade-in zoom-in duration-500",
                className
            )}
        >
            {Icon && (
                <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-muted">
                    <Icon className="w-6 h-6 text-muted-foreground" />
                </div>
            )}
            <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-sm">
                {description}
            </p>
            {action && <div>{action}</div>}
        </div>
    );
}
