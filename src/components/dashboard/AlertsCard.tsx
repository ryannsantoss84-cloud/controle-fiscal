
import { AlertCircle, Clock, User, FileText, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AlertsCardProps {
  items: any[];
}

const statusConfig = {
  pending: { label: "Pendente", badgeVariant: "secondary" as const },
  in_progress: { label: "Em Andamento", badgeVariant: "default" as const },
  completed: { label: "Concluída", badgeVariant: "default" as const },
  overdue: { label: "Atrasada", badgeVariant: "destructive" as const },
};

export function AlertsCard({ items }: AlertsCardProps) {
  const today = new Date();
  const upcomingItems = items
    .filter((o) => o.status !== "completed" && o.status !== "paid")
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-warning" />
          Próximos Vencimentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum item pendente
            </p>
          ) : (
            upcomingItems.map((item) => {
              const daysUntilDue = Math.ceil(
                (new Date(item.due_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
              );
              const config = statusConfig[item.status];

              let displayTitle = "Item";
              let displayClient = null;
              let icon = <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />;

              if (item.type === 'obligation' || item.type === 'tax') {
                displayTitle = item.title;
                displayClient = item.clients?.name;
                icon = item.type === 'tax' ? <User className="h-4 w-4 text-muted-foreground mt-0.5" /> : <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />;
              } else if ('installment_number' in item) { // Parcela
                displayTitle = `Parcela ${item.installment_number}/${item.total_installments}`;
                displayClient = item.obligations?.clients?.name;
                icon = <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />;
              }

              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  {icon}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium truncate">
                        {displayTitle}
                      </p>
                      {config && (
                        <Badge variant={config.badgeVariant} className="shrink-0">
                          {config.label}
                        </Badge>
                      )}
                    </div>
                    {displayClient && (
                      <p className="text-xs text-muted-foreground">
                        {displayClient}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(item.due_date), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                      {daysUntilDue >= 0 && (
                        <span className="text-xs text-muted-foreground">
                          • {daysUntilDue === 0 ? "Hoje" : `${daysUntilDue} dias`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
