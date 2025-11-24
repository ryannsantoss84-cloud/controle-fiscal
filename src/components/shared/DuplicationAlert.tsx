import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DuplicationCheck } from "@/lib/duplicationValidator";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface DuplicationAlertProps {
    check: DuplicationCheck;
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: "Pendente", variant: "secondary" },
    in_progress: { label: "Em Andamento", variant: "default" },
    completed: { label: "Concluída", variant: "default" },
    overdue: { label: "Atrasada", variant: "destructive" },
};

export function DuplicationAlert({
    check,
    open,
    onConfirm,
    onCancel
}: DuplicationAlertProps) {

    const isExact = check.level === 'exact';

    return (
        <AlertDialog open={open}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        {isExact ? (
                            <>
                                <span className="text-2xl">🚫</span>
                                <span>Duplicata Detectada</span>
                            </>
                        ) : (
                            <>
                                <span className="text-2xl">⚠️</span>
                                <span>Possível Duplicata</span>
                            </>
                        )}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3">
                        <p className="text-base">{check.message}</p>

                        {check.existingObligation && (
                            <div className="mt-4 p-4 bg-muted rounded-lg space-y-2 border">
                                <p className="font-semibold text-foreground">Obrigação Existente:</p>
                                <div className="space-y-1 text-sm">
                                    <p><span className="font-medium">Título:</span> {check.existingObligation.title}</p>
                                    <p><span className="font-medium">Vencimento:</span> {formatDate(check.existingObligation.due_date)}</p>
                                    <p className="flex items-center gap-2">
                                        <span className="font-medium">Status:</span>
                                        <Badge variant={statusConfig[check.existingObligation.status]?.variant || "secondary"}>
                                            {statusConfig[check.existingObligation.status]?.label || check.existingObligation.status}
                                        </Badge>
                                    </p>
                                    {check.existingObligation.recurrence && check.existingObligation.recurrence !== 'none' && (
                                        <p><span className="font-medium">Recorrência:</span> {check.existingObligation.recurrence}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {isExact && (
                            <p className="text-sm text-destructive font-medium mt-2">
                                ⚠️ Não é possível criar obrigações duplicadas. Verifique a obrigação existente acima.
                            </p>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel}>
                        {isExact ? 'Entendi' : 'Cancelar'}
                    </AlertDialogCancel>
                    {!isExact && (
                        <AlertDialogAction onClick={onConfirm} className="bg-warning hover:bg-warning/90">
                            Criar Mesmo Assim
                        </AlertDialogAction>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
