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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  clientName?: string;
  dueDate?: string;
  relatedCount?: number;
}

export function DeleteConfirmation({
  open,
  onOpenChange,
  onConfirm,
  title,
  itemName,
  clientName,
  dueDate,
  relatedCount,
}: DeleteConfirmationProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>Você está prestes a excluir:</p>
              <div className="p-3 bg-muted rounded-md">
                <strong className="block">{itemName}</strong>
                {clientName && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Cliente: {clientName}
                  </div>
                )}
                {dueDate && (
                  <div className="text-sm text-muted-foreground">
                    Vencimento: {dueDate}
                  </div>
                )}
              </div>
              
              {relatedCount && relatedCount > 0 && (
                <Alert variant="destructive" className="mt-3">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Atenção: Este item possui {relatedCount} item(ns) relacionado(s).
                    Eles também serão excluídos.
                  </AlertDescription>
                </Alert>
              )}
              
              <p className="text-sm text-muted-foreground">
                Esta ação não pode ser desfeita.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Confirmar Exclusão
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
