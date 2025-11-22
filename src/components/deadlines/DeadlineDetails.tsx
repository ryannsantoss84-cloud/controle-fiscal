open: boolean;
onOpenChange: (open: boolean) => void;
}

const statusConfig = {
  pending: { label: "Pendente", variant: "secondary" as const },
  in_progress: { label: "Em Andamento", variant: "default" as const },
  completed: { label: "Concluída", variant: "default" as const },
  overdue: { label: "Atrasada", variant: "destructive" as const },
};

const recurrenceLabels = {
  none: "Não se repete",
  monthly: "Mensal",
  quarterly: "Trimestral",
  semiannual: "Semestral",
  annual: "Anual",
};

const installmentStatusConfig = {
  pending: { label: "Pendente", variant: "secondary" as const },
  paid: { label: "Pago", variant: "default" as const },
  overdue: { label: "Atrasado", variant: "destructive" as const },
};

export function DeadlineDetails({ deadline, open, onOpenChange }: DeadlineDetailsProps) {
  const { installments } = useInstallments();
  const deadlineInstallments = installments.filter(i => i.obligation_id === deadline.id);

  const isWeekendDue = deadline.due_date ? isWeekend(new Date(deadline.due_date)) : false;
  const suggestedDate = isWeekendDue && deadline.due_date
    ? addDays(new Date(deadline.due_date), new Date(deadline.due_date).getDay() === 6 ? 2 : 1)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-2xl">{deadline.title}</DialogTitle>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={statusConfig[deadline.status].variant}>
                {statusConfig[deadline.status].label}
              </Badge>
              <Badge variant={deadline.type === 'tax' ? 'destructive' : 'outline'} className="font-normal text-xs">{deadline.type === 'tax' ? 'Imposto' : 'Obrigação'}</Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {deadline.description && (
            <div>
              <p className="text-muted-foreground">{deadline.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {deadline.clients && (
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Cliente</p>
                  <p className="text-sm text-muted-foreground">{deadline.clients.name}</p>
                </div>
              </div>
            )}

            {deadline.due_date && (
              <div className="flex items-start gap-3">
                <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Vencimento</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(deadline.due_date)}
                  </p>
                  {isWeekendDue && (
                    <div className="flex items-center gap-1 mt-1 text-warning">
                      <AlertTriangle className="h-3 w-3" />
                      <p className="text-xs">
                        Cai no final de semana
                        {suggestedDate && ` - Sugestão: ${format(suggestedDate, "dd/MM/yyyy")}`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {deadline.responsible && (
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Responsável</p>
                  <p className="text-sm text-muted-foreground">{deadline.responsible}</p>
                </div>
              </div>
            )}

            {deadline.recurrence !== "none" && (
              <div className="flex items-start gap-3">
                <Repeat className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Recorrência</p>
                  <p className="text-sm text-muted-foreground">{recurrenceLabels[deadline.recurrence]}</p>
                </div>
              </div>
            )}

          </div>

          {deadline.notes && (
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Observações</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{deadline.notes}</p>
            </div>
          )}

          {deadlineInstallments.length > 0 && (
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">Parcelas ({deadlineInstallments.length})</p>
              <div className="space-y-2">
                {deadlineInstallments.map((installment) => {
                  const installmentWeekend = isWeekend(new Date(installment.due_date));

                  return (
                    <div key={installment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            Parcela {installment.installment_number}/{installment.total_installments}
                          </span>
                          {installment.status === 'paid' && (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarIcon className="h-4 w-4" />
                          {formatDate(installment.due_date)}
                          {installmentWeekend && (
                            <AlertTriangle className="h-3 w-3 text-warning" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={installmentStatusConfig[installment.status].variant}>
                          {installmentStatusConfig[installment.status].label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {deadline.completed_at && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Concluída</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(deadline.completed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
