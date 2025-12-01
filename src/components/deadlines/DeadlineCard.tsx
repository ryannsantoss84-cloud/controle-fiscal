import { CalendarIcon, Building2, Repeat, CheckCircle2, User, AlertTriangle, Edit, FileText } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Deadline, useDeadlines } from "@/hooks/useDeadlines";
import { format, isWeekend } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { DeadlineDetails } from "./DeadlineDetails";
import { DeadlineEditForm } from "@/components/forms/DeadlineEditForm";
import { formatDate } from "@/lib/utils";
import { TimeTracker } from "@/components/shared/TimeTracker";

interface DeadlineCardProps {
  deadline: Deadline & { clients?: { id: string; name: string } | null; };
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

const statusConfig = {
  pending: { label: "Pendente", badgeVariant: "secondary" as const },
  in_progress: { label: "Em Andamento", badgeVariant: "default" as const },
  completed: { label: "Concluída", badgeVariant: "default" as const },
  overdue: { label: "Atrasada", badgeVariant: "destructive" as const },
};

const recurrenceLabels = {
  none: "Não se repete",
  monthly: "Mensal",
  quarterly: "Trimestral",
  semiannual: "Semestral",
  annual: "Anual",
};

export function DeadlineCard({ deadline, isSelected, onToggleSelect }: DeadlineCardProps) {
  const config = statusConfig[deadline.status];
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const { updateDeadline } = useDeadlines();
  const isWeekendDue = deadline.due_date ? isWeekend(new Date(deadline.due_date)) : false;

  const handleQuickStatusChange = async (e: React.MouseEvent, newStatus: string) => {
    e.stopPropagation();
    await updateDeadline.mutateAsync({
      id: deadline.id,
      status: newStatus as any,
      completed_at: newStatus === "completed" ? new Date().toISOString() : null,
    });
  };

  return (
    <>
      <Card className="flex flex-col h-full border-border/40 shadow-sm hover:shadow-md transition-all duration-200 bg-card/50 cursor-pointer" onClick={() => setDetailsOpen(true)}>
        <CardHeader className="pb-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3 flex-1">
              {onToggleSelect && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleSelect(deadline.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1"
                />
              )}
              <h3 className="text-base font-medium text-foreground leading-tight">{deadline.title}</h3>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={config.badgeVariant} className="font-normal">{config.label}</Badge>
              <div className="flex gap-1">
                <Badge variant={deadline.type === 'tax' ? 'destructive' : 'outline'} className="font-normal text-xs">{deadline.type === 'tax' ? 'Imposto' : 'Obrigação'}</Badge>
                {deadline.sphere && (
                  <Badge variant="outline" className="font-normal text-xs capitalize">
                    {deadline.sphere === 'federal' ? 'Federal' : deadline.sphere === 'state' ? 'Estadual' : 'Municipal'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {deadline.description && (
            <p className="text-sm text-muted-foreground font-normal mt-1 line-clamp-2">{deadline.description}</p>
          )}
        </CardHeader>

        <CardContent className="flex-1 space-y-2 pb-3">
          {deadline.clients && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{deadline.clients.name}</span>
            </div>
          )}

          {deadline.due_date && (
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <span>
                  Vencimento: {formatDate(deadline.due_date)}
                </span>
                {isWeekendDue && (
                  <div className="flex items-center gap-1 text-warning" title="Vence no final de semana">
                    <AlertTriangle className="h-3 w-3" />
                    <span className="text-xs">FDS</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {deadline.responsible && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{deadline.responsible}</span>
            </div>
          )}

          {deadline.recurrence !== "none" && (
            <div className="flex items-center gap-2 text-sm">
              <Repeat className="h-4 w-4 text-muted-foreground" />
              <span>{recurrenceLabels[deadline.recurrence]}</span>
            </div>
          )}

          {deadline.completed_at && (
            <div className="flex items-center gap-2 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                Concluída em {formatDate(deadline.completed_at)}
              </span>
            </div>
          )}

          {/* Controle de Tempo */}
          <TimeTracker
            createdAt={deadline.created_at}
            completedAt={deadline.completed_at}
            timeSpentMinutes={deadline.time_spent_minutes}
            status={deadline.status}
            compact
          />
        </CardContent>

        <CardFooter className="pt-3 border-t flex flex-col gap-2">
          <div className="flex gap-2 w-full">
            {deadline.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => handleQuickStatusChange(e, "in_progress")}
                >
                  Iniciar
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => handleQuickStatusChange(e, "completed")}
                >
                  Concluir
                </Button>
              </>
            )}
            {deadline.status === "in_progress" && (
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={(e) => handleQuickStatusChange(e, "completed")}
              >
                Concluir
              </Button>
            )}
            {deadline.status === "completed" && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={(e) => handleQuickStatusChange(e, "pending")}
              >
                Reabrir
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setEditOpen(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      <DeadlineDetails
        deadline={deadline}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      <DeadlineEditForm
        deadline={deadline}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
