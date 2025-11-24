import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Calendar, DollarSign, FileText } from "lucide-react";
import { SortableColumn } from "@/components/shared/SortableColumn";
import { SortDirection } from "@/hooks/useSorting";

interface Installment {
    id: string;
    name: string | null;
    protocol: string | null;
    due_date: string;
    amount: number;
    status: string;
    deadline?: {
        title: string;
        clients?: {
            name: string;
        };
    };
    clients?: {
        name: string;
    };
}

interface InstallmentTableProps {
    installments: Installment[];
    sortConfig: { key: string; direction: SortDirection };
    onSort: (key: string) => void;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: "Pendente", variant: "secondary" },
    paid: { label: "Pago", variant: "default" },
    completed: { label: "Concluído", variant: "default" },
    overdue: { label: "Atrasado", variant: "destructive" },
};

export function InstallmentTable({
    installments,
    sortConfig,
    onSort,
}: InstallmentTableProps) {
    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>
                            <SortableColumn
                                label="Nome/Protocolo"
                                sortKey="name"
                                currentSortKey={sortConfig.key}
                                currentSortDirection={sortConfig.direction}
                                onSort={onSort}
                            />
                        </TableHead>
                        <TableHead>
                            <SortableColumn
                                label="Cliente"
                                sortKey="clients.name"
                                currentSortKey={sortConfig.key}
                                currentSortDirection={sortConfig.direction}
                                onSort={onSort}
                            />
                        </TableHead>
                        <TableHead>
                            <SortableColumn
                                label="Vencimento"
                                sortKey="due_date"
                                currentSortKey={sortConfig.key}
                                currentSortDirection={sortConfig.direction}
                                onSort={onSort}
                            />
                        </TableHead>
                        <TableHead>
                            <SortableColumn
                                label="Valor"
                                sortKey="amount"
                                currentSortKey={sortConfig.key}
                                currentSortDirection={sortConfig.direction}
                                onSort={onSort}
                            />
                        </TableHead>
                        <TableHead>
                            <SortableColumn
                                label="Status"
                                sortKey="status"
                                currentSortKey={sortConfig.key}
                                currentSortDirection={sortConfig.direction}
                                onSort={onSort}
                            />
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {installments.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                Nenhuma parcela encontrada.
                            </TableCell>
                        </TableRow>
                    ) : (
                        installments.map((installment) => {
                            const config = statusConfig[installment.status] || statusConfig.pending;
                            const clientName = installment.clients?.name || installment.deadline?.clients?.name;

                            return (
                                <TableRow key={installment.id} className="group hover:bg-muted/50">
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{installment.name || "Sem nome"}</span>
                                            {installment.protocol && (
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <FileText className="h-3 w-3" />
                                                    {installment.protocol}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {clientName ? (
                                            <span className="text-sm">{clientName}</span>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {installment.due_date && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span>{formatDate(installment.due_date)}</span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                            {installment.amount ? `R$ ${installment.amount.toFixed(2)}` : "-"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={config.variant} className="font-normal">
                                            {config.label}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
