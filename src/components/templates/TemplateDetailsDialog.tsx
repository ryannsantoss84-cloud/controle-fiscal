import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { type Template } from "@/hooks/useTemplates";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Receipt } from "lucide-react";

interface TemplateDetailsDialogProps {
    template: Template | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const recurrenceLabels: Record<string, string> = {
    none: "Única",
    monthly: "Mensal",
    quarterly: "Trimestral",
    semiannual: "Semestral",
    annual: "Anual",
};

const typeLabels: Record<string, string> = {
    obligation: "Obrigação",
    tax: "Imposto",
};

export function TemplateDetailsDialog({ template, open, onOpenChange }: TemplateDetailsDialogProps) {
    if (!template) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {template.type === "obligation" ? (
                            <FileText className="h-5 w-5 text-blue-500" />
                        ) : (
                            <Receipt className="h-5 w-5 text-green-500" />
                        )}
                        {template.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Informações Gerais */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-sm text-muted-foreground">Informações Gerais</h3>

                        {template.description && (
                            <div>
                                <p className="text-sm text-muted-foreground">Descrição</p>
                                <p className="text-sm">{template.description}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Tipo</p>
                                <Badge variant={template.type === "obligation" ? "default" : "secondary"}>
                                    {typeLabels[template.type] || template.type}
                                </Badge>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Recorrência</p>
                                <Badge variant="outline" className="gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {recurrenceLabels[template.recurrence] || template.recurrence}
                                </Badge>
                            </div>
                        </div>

                        {template.day_of_month && (
                            <div>
                                <p className="text-sm text-muted-foreground">Dia de Vencimento</p>
                                <p className="text-sm font-medium">Dia {template.day_of_month}</p>
                            </div>
                        )}

                        {template.weekend_rule && (
                            <div>
                                <p className="text-sm text-muted-foreground">Regra para Finais de Semana</p>
                                <p className="text-sm">
                                    {template.weekend_rule === "postpone" && "Postergar para próximo dia útil"}
                                    {template.weekend_rule === "anticipate" && "Antecipar para dia útil anterior"}
                                    {template.weekend_rule === "keep" && "Manter no mesmo dia"}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Regimes Tributários */}
                    {template.tax_regimes && template.tax_regimes.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm text-muted-foreground">Regimes Tributários</h3>
                            <div className="flex flex-wrap gap-2">
                                {template.tax_regimes.map((regime) => (
                                    <Badge key={regime} variant="outline">
                                        {regime === "simples_nacional" && "Simples Nacional"}
                                        {regime === "lucro_presumido" && "Lucro Presumido"}
                                        {regime === "lucro_real" && "Lucro Real"}
                                        {regime === "mei" && "MEI"}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Atividades */}
                    {template.business_activities && template.business_activities.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm text-muted-foreground">Atividades</h3>
                            <div className="flex flex-wrap gap-2">
                                {template.business_activities.map((activity) => (
                                    <Badge key={activity} variant="outline">
                                        {activity === "commerce" && "Comércio"}
                                        {activity === "service" && "Serviço"}
                                        {activity === "both" && "Ambos"}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Obrigações do Template */}
                    {template.items && template.items.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="font-semibold text-sm text-muted-foreground">
                                Obrigações ({template.items.length})
                            </h3>
                            <div className="space-y-2">
                                {template.items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="p-3 border rounded-lg bg-muted/20 space-y-2"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="font-medium">{item.title}</p>
                                                {item.description && (
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>
                                            <Badge variant={item.type === "obligation" ? "default" : "secondary"}>
                                                {typeLabels[item.type]}
                                            </Badge>
                                        </div>

                                        <div className="flex flex-wrap gap-2 text-sm">
                                            <Badge variant="outline" className="gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {recurrenceLabels[item.recurrence]}
                                            </Badge>

                                            {item.day_of_month && (
                                                <Badge variant="outline">
                                                    Dia {item.day_of_month}
                                                </Badge>
                                            )}

                                            {item.weekend_rule && (
                                                <Badge variant="outline" className="text-xs">
                                                    {item.weekend_rule === "postpone" && "Postergar"}
                                                    {item.weekend_rule === "anticipate" && "Antecipar"}
                                                    {item.weekend_rule === "keep" && "Manter"}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
