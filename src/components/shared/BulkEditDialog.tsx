import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type BulkEditField = 'status' | 'due_date' | 'responsible' | 'amount' | 'notes';

interface BulkEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedCount: number;
    onConfirm: (field: BulkEditField, value: any) => Promise<void>;
}

export function BulkEditDialog({ open, onOpenChange, selectedCount, onConfirm }: BulkEditDialogProps) {
    const [field, setField] = useState<BulkEditField>('status');
    const [value, setValue] = useState<any>("");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!value && value !== 0) return;
        setIsSaving(true);
        try {
            await onConfirm(field, value);
            onOpenChange(false);
            setValue("");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar em Massa</DialogTitle>
                    <DialogDescription>
                        Alterando {selectedCount} itens selecionados.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Campo para alterar</Label>
                        <Select value={field} onValueChange={(v) => { setField(v as BulkEditField); setValue(""); }}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="status">Status</SelectItem>
                                <SelectItem value="due_date">Data de Vencimento</SelectItem>
                                <SelectItem value="amount">Valor</SelectItem>
                                <SelectItem value="responsible">Responsável</SelectItem>
                                <SelectItem value="notes">Observações</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Novo Valor</Label>

                        {field === 'status' && (
                            <Select value={value} onValueChange={setValue}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pendente</SelectItem>
                                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                                    <SelectItem value="completed">Concluída</SelectItem>
                                    <SelectItem value="overdue">Atrasada</SelectItem>
                                </SelectContent>
                            </Select>
                        )}

                        {field === 'responsible' && (
                            <Input
                                placeholder="Nome do responsável"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                            />
                        )}

                        {field === 'amount' && (
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={value}
                                onChange={(e) => setValue(Number(e.target.value))}
                            />
                        )}

                        {field === 'notes' && (
                            <Textarea
                                placeholder="Adicionar observação..."
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                            />
                        )}

                        {field === 'due_date' && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !value && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {value ? format(value, "dd/MM/yyyy") : <span>Selecione uma data</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={value}
                                        onSelect={setValue}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={isSaving || (!value && value !== 0)}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Aplicar Alterações
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
