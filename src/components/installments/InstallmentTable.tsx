import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/lib/utils";
import { Calendar, FileText } from "lucide-react";
import { SortableColumn } from "@/components/shared/SortableColumn";
import { SortDirection } from "@/hooks/useSorting";

import { Installment as SharedInstallment } from "@/hooks/useInstallments";

// Extend or alias the shared type if needed, or just use it directly.
// The local interface had 'deadline' structure that might be slightly different or just enriched.
// Let's check the local definition vs shared.
// Local:
// deadline?: { title: string; clients?: { name: string; }; };
// Shared Installment doesn't have deadline.
// But EnrichedInstallment in Installments.tsx adds deadline.
// InstallmentTable receives `installments` which are `EnrichedInstallment[]`.

// So we should define the prop type based on what is passed.
import { Deadline } from "@/hooks/useDeadlines";

type TableInstallment = SharedInstallment & {
    deadline?: Deadline;
};


interface InstallmentTableProps {
    installments: TableInstallment[];
    sortConfig: { key: string; direction: SortDirection };
    onSort: (key: string) => void;
    selectedIds?: Set<string>;
    onToggleSelect?: (id: string) => void;
    onSelectAll?: () => void;
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
    selectedIds,
    onToggleSelect,
    onSelectAll,
}: InstallmentTableProps) {
    const allSelected = installments.length > 0 && selectedIds?.size === installments.length;

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]">
                            {onSelectAll && (
                                <Checkbox
                                    checked={allSelected}
                                    onCheckedChange={onSelectAll}
                                />
                            )}
                        </TableHead>
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
                            const isSelected = selectedIds?.has(installment.id);

                            return (
                                <TableRow key={installment.id} className="group hover:bg-muted/50">
                                    <TableCell>
                                        {onToggleSelect && (
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => onToggleSelect(installment.id)}
                                            />
                                        )}
                                    </TableCell>
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
