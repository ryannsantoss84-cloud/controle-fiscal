import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { isWeekend, getWeekdayName } from "@/lib/weekendUtils";
import { parseISO } from "date-fns";

interface WeekendBadgeProps {
  dueDate: string;
  originalDate?: string | null;
}

export function WeekendBadge({ dueDate, originalDate }: WeekendBadgeProps) {
  const dueDateObj = parseISO(dueDate);
  const originalDateObj = originalDate ? parseISO(originalDate) : null;

  // Se tem data original diferente, significa que foi ajustada
  if (originalDateObj && originalDate !== dueDate && isWeekend(originalDateObj)) {
    return (
      <Badge variant="outline" className="gap-1 border-orange-500 text-orange-700 dark:text-orange-400">
        <Calendar className="h-3 w-3" />
        Ajustado (era {getWeekdayName(originalDateObj)})
      </Badge>
    );
  }

  // Se a data atual cai no final de semana
  if (isWeekend(dueDateObj)) {
    return (
      <Badge variant="outline" className="gap-1 border-amber-500 text-amber-700 dark:text-amber-400">
        <Calendar className="h-3 w-3" />
        {getWeekdayName(dueDateObj)}
      </Badge>
    );
  }

  return null;
}
