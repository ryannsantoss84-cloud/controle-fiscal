import { Button } from "@/components/ui/button";
import { CheckCircle2, RotateCcw, Trash2, X, ChevronDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BulkActionBarProps {
    selectedCount: number;
    onClearSelection: () => void;
    onDelete?: () => void;
    onComplete?: () => void;
    onReopen?: () => void;
}

export function BulkActionBar({
    selectedCount,
    onClearSelection,
    onDelete,
    onComplete,
    onReopen,
}: BulkActionBarProps) {
    if (selectedCount === 0) return null;

    return (
        <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg flex items-center justify-between animate-in slide-in-from-top-2">
            <span className="text-sm font-medium text-primary">
                {selectedCount} item(s) selecionado(s)
            </span>
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="default" size="sm" className="gap-2">
                            Ações em Massa <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {onComplete && (
                            <DropdownMenuItem onClick={onComplete} className="gap-2">
                                <CheckCircle2 className="h-4 w-4 text-success" />
                                Concluir Selecionados
                            </DropdownMenuItem>
                        )}
                        {onReopen && (
                            <DropdownMenuItem onClick={onReopen} className="gap-2">
                                <RotateCcw className="h-4 w-4 text-warning" />
                                Reabrir Selecionados
                            </DropdownMenuItem>
                        )}
                        {onDelete && (
                            <DropdownMenuItem onClick={onDelete} className="gap-2 text-destructive focus:text-destructive">
                                <Trash2 className="h-4 w-4" />
                                Excluir Selecionados
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearSelection}
                >
                    Cancelar
                </Button>
            </div>
        </div>
    );
}
