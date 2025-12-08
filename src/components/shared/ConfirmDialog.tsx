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
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
    isOpen: boolean;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'destructive' | 'default';
    onConfirm: () => void;
    onCancel: () => void;
}

/**
 * Componente de diálogo de confirmação reutilizável.
 * Use em conjunto com o hook useConfirm para gerenciamento de estado.
 */
export function ConfirmDialog({
    isOpen,
    title = 'Confirmar ação',
    description = 'Tem certeza que deseja continuar?',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'default',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel}>
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className={cn(
                            variant === 'destructive' &&
                            "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        )}
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
