import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Deadline } from "@/hooks/useDeadlines";
import { formatDate } from "@/lib/utils";
import { Building2, Calendar, User, AlertTriangle } from "lucide-react";
import { isWeekend } from "date-fns";
import { useState } from "react";
import { DeadlineDetails } from "./DeadlineDetails";
import { SortableColumn } from "@/components/shared/SortableColumn";
import { SortDirection } from "@/hooks/useSorting";

interface DeadlineTableProps {
    deadlines: Deadline[];
    selectedIds: Set<string>;
    onToggleSelect: (id: string) => void;
    onSelectAll: () => void;
    sortConfig: { key: string; direction: SortDirection };
    onSort: (key: string) => void;
}

const statusConfig = {
    pending: { label: "Pendente", variant: "secondary" as const },
    in_progress: { label: "Em Andamento", variant: "default" as const },
    completed: { label: "Concluída", variant: "default" as const },
    overdue: { label: "Atrasada", variant: "destructive" as const },
};

export function DeadlineTable({
    deadlines,
    selectedIds,
    onToggleSelect,
    onSelectAll,
    sortConfig,
    onSort,
}: DeadlineTableProps) {
    const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null);

    return (
        <>
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={deadlines.length > 0 && selectedIds.size === deadlines.length}
                                    onCheckedChange={onSelectAll}
                                    aria-label="Select all"
                                />
                            </TableHead>
                            <TableHead>
                                <SortableColumn
                                    label="Título"
                                    sortKey="title"
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
                                    label="Responsável"
                                    sortKey="responsible"
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
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {deadlines.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    Nenhum prazo encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            deadlines.map((deadline) => {
                                const config = statusConfig[deadline.status];
                                const isWeekendDue = deadline.due_date ? isWeekend(new Date(deadline.due_date)) : false;

                                return (
                                    <TableRow key={deadline.id} className="group hover:bg-muted/50 cursor-pointer" onClick={() => setSelectedDeadline(deadline)}>
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                checked={selectedIds.has(deadline.id)}
                                                onCheckedChange={() => onToggleSelect(deadline.id)}
                                                aria-label={`Select ${deadline.title}`}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span>{deadline.title}</span>
                                                {deadline.description && (
                                                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                        {deadline.description}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {deadline.clients && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    <span>{deadline.clients.name}</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {deadline.due_date && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <div className="flex items-center gap-2">
                                                        <span>{formatDate(deadline.due_date)}</span>
                                                        {isWeekendDue && (
                                                            <AlertTriangle className="h-3 w-3 text-warning" title="Vence no final de semana" />
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {deadline.responsible ? (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <span>{deadline.responsible}</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={config.variant} className="font-normal">
                                                {config.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedDeadline(deadline);
                                                }}
                                            >
                                                Detalhes
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {selectedDeadline && (
                <DeadlineDetails
                    deadline={selectedDeadline}
                    open={!!selectedDeadline}
                    onOpenChange={(open) => !open && setSelectedDeadline(null)}
                />
            )}
        </>
    );
}
