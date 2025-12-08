import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { format, addDays, isAfter, isBefore, startOfDay, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

interface TimelineItem {
    id: string;
    title: string;
    due_date: string;
    status: string;
    type: "obligation" | "tax";
    client_name?: string;
    sphere?: "federal" | "state" | "municipal";
}

interface TimelineWidgetProps {
    items: TimelineItem[];
}

type TimelinePeriod = "7" | "15" | "30";

export function TimelineWidget({ items }: TimelineWidgetProps) {
    const [period, setPeriod] = useState<TimelinePeriod>("7");
    const navigate = useNavigate();

    const handleItemClick = (itemId: string) => {
        // Redireciona para a página de obligations (pode ser /deadlines ou /obligations dependendo do tipo)
        navigate('/obligations');
    };

    const filteredItems = useMemo(() => {
        const today = startOfDay(new Date());
        const endDate = addDays(today, parseInt(period));

        return items
            .filter((item) => {
                if (item.status === "completed" || item.status === "paid") return false;
                // Usar parseISO para evitar problemas de timezone
                const dueDate = startOfDay(parseISO(item.due_date));
                return isAfter(dueDate, today) || dueDate.getTime() === today.getTime();
            })
            .filter((item) => {
                const dueDate = startOfDay(parseISO(item.due_date));
                return isBefore(dueDate, endDate) || dueDate.getTime() === endDate.getTime();
            })
            .sort((a, b) => parseISO(a.due_date).getTime() - parseISO(b.due_date).getTime());
    }, [items, period]);

    const groupedByDate = useMemo(() => {
        const groups: Record<string, TimelineItem[]> = {};
        filteredItems.forEach((item) => {
            const dateKey = item.due_date;
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(item);
        });
        return groups;
    }, [filteredItems]);

    const getUrgencyLevel = (dueDate: string) => {
        const today = startOfDay(new Date());
        const due = startOfDay(parseISO(dueDate));
        const days = differenceInDays(due, today);

        if (days <= 2) return "urgent"; // Vermelho
        if (days <= 7) return "warning"; // Amarelo
        return "info"; // Azul
    };

    const getUrgencyColor = (level: string) => {
        switch (level) {
            case "urgent":
                return "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400";
            case "warning":
                return "bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-400";
            default:
                return "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400";
        }
    };

    const getUrgencyIcon = (level: string) => {
        switch (level) {
            case "urgent":
                return <AlertCircle className="h-4 w-4" />;
            case "warning":
                return <Clock className="h-4 w-4" />;
            default:
                return <Calendar className="h-4 w-4" />;
        }
    };

    const getTypeColor = (type: string) => {
        return type === "tax" ? "bg-purple-500/10 text-purple-700" : "bg-blue-500/10 text-blue-700";
    };

    return (
        <Card className="border-none shadow-lg">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        Timeline de Vencimentos
                    </CardTitle>
                    <Tabs value={period} onValueChange={(v) => setPeriod(v as TimelinePeriod)}>
                        <TabsList>
                            <TabsTrigger value="7">7 dias</TabsTrigger>
                            <TabsTrigger value="15">15 dias</TabsTrigger>
                            <TabsTrigger value="30">30 dias</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            <CardContent>
                {filteredItems.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">Nenhum vencimento próximo</p>
                        <p className="text-sm">Tudo em dia nos próximos {period} dias!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(groupedByDate).map(([date, dateItems]) => {
                            const urgencyLevel = getUrgencyLevel(date);
                            // Usar parseISO para evitar problemas de timezone
                            const dueDate = parseISO(date);
                            const today = startOfDay(new Date());
                            const daysUntil = differenceInDays(startOfDay(dueDate), today);

                            return (
                                <div key={date} className="space-y-3">
                                    {/* Header da Data */}
                                    <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border ${getUrgencyColor(urgencyLevel)}`}>
                                        {getUrgencyIcon(urgencyLevel)}
                                        <div className="flex-1">
                                            <div className="font-semibold">
                                                {format(dueDate, "dd 'de' MMMM", { locale: ptBR })}
                                            </div>
                                            <div className="text-xs opacity-75">
                                                {daysUntil === 0
                                                    ? "Hoje"
                                                    : daysUntil === 1
                                                        ? "Amanhã"
                                                        : `Em ${daysUntil} dias`}
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            {dateItems.length} {dateItems.length === 1 ? "item" : "itens"}
                                        </Badge>
                                    </div>

                                    {/* Itens da Data */}
                                    <div className="space-y-2 ml-4 border-l-2 border-muted pl-4">
                                        {dateItems.map((item) => (
                                            <div
                                                key={item.id}
                                                onClick={() => handleItemClick(item.id)}
                                                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-primary/10 hover:border-primary/30 transition-all cursor-pointer border border-border/50 group"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm truncate group-hover:text-primary transition-colors">{item.title}</div>
                                                    {item.client_name && (
                                                        <div className="text-xs text-muted-foreground">{item.client_name}</div>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Badge className={`text-xs ${getTypeColor(item.type)}`}>
                                                        {item.type === "tax" ? "Imposto" : "Obrigação"}
                                                    </Badge>
                                                    {item.sphere && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {item.sphere === "federal"
                                                                ? "Federal"
                                                                : item.sphere === "state"
                                                                    ? "Estadual"
                                                                    : "Municipal"}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
