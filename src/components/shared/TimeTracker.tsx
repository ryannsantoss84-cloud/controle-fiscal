import { Clock } from "lucide-react";
import { formatDistanceToNow, parseISO, differenceInMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TimeTrackerProps {
    createdAt: string;
    completedAt?: string | null;
    timeSpentMinutes?: number | null;
    status?: string;
    compact?: boolean;
}

/**
 * Formata minutos para formato legível (ex: "2h 30min", "3d 5h", "45min")
 */
function formatTimeMinutes(minutes: number): string {
    if (minutes < 60) {
        return `${Math.round(minutes)}min`;
    }

    if (minutes < 1440) { // Menos de 1 dia
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }

    // 1 dia ou mais
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
}

/**
 * Calcula tempo decorrido desde a criação até agora
 */
function calculateElapsedMinutes(createdAt: string): number {
    try {
        const created = parseISO(createdAt);
        const now = new Date();
        return differenceInMinutes(now, created);
    } catch {
        return 0;
    }
}

export function TimeTracker({
    createdAt,
    completedAt,
    timeSpentMinutes,
    status,
    compact = false
}: TimeTrackerProps) {
    // Se foi concluído e temos o tempo calculado
    if (completedAt && timeSpentMinutes) {
        const formattedTime = formatTimeMinutes(timeSpentMinutes);

        if (compact) {
            return (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formattedTime}</span>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-green-600" />
                <span>
                    Concluído em <span className="font-medium text-green-600">{formattedTime}</span>
                </span>
            </div>
        );
    }

    // Se está em andamento (não concluído)
    if (status && status !== 'completed' && status !== 'paid') {
        const elapsedMinutes = calculateElapsedMinutes(createdAt);
        const formattedTime = formatTimeMinutes(elapsedMinutes);

        if (compact) {
            return (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 animate-pulse text-blue-600" />
                    <span>{formattedTime}</span>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 animate-pulse text-blue-600" />
                <span>
                    Em andamento há <span className="font-medium text-blue-600">{formattedTime}</span>
                </span>
            </div>
        );
    }

    // Sem informação de tempo
    return null;
}
