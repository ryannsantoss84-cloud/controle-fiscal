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

interface ConfirmLargeInstallmentDialogProps {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    count: number;
}

export function ConfirmLargeInstallmentDialog({
    open,
    onConfirm,
    onCancel,
    count,
}: ConfirmLargeInstallmentDialogProps) {
    return (
        <AlertDialog open={open}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Criar {count} parcelas?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Você está prestes a criar {count} parcelas automaticamente. Este processo pode levar alguns segundos.
                        {count > 100 && (
                            <span className="block mt-2 text-amber-600 dark:text-amber-400 font-medium">
                                ⚠️ Volume grande detectado. O processo será feito em lotes para garantir estabilidade.
                            </span>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>Confirmar e Criar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
