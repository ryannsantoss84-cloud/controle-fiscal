import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface ProgressDialogProps {
    open: boolean;
    progress: number;
    total: number;
}

export function ProgressDialog({ open, progress, total }: ProgressDialogProps) {
    const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;

    return (
        <Dialog open={open}>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Criando parcelas...
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Progress value={percentage} className="h-2" />
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-center">
                            {progress} de {total} parcelas criadas
                        </p>
                        <p className="text-xs text-muted-foreground text-center">
                            {percentage}% concluído
                        </p>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                        Por favor, aguarde. Não feche esta janela.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
