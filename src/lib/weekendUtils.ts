import { addDays, subDays, getDay, format } from "date-fns";

export type WeekendHandling = "advance" | "postpone" | "next_business_day";

/**
 * Verifica se uma data cai no final de semana
 */
export function isWeekend(date: Date): boolean {
  const day = getDay(date);
  return day === 0 || day === 6; // 0 = domingo, 6 = sábado
}

/**
 * Obtém o próximo dia útil (segunda-feira)
 */
export function getNextBusinessDay(date: Date): Date {
  const day = getDay(date);
  if (day === 0) return addDays(date, 1); // domingo -> segunda
  if (day === 6) return addDays(date, 2); // sábado -> segunda
  return date;
}

/**
 * Obtém o dia útil anterior (sexta-feira)
 */
export function getPreviousBusinessDay(date: Date): Date {
  const day = getDay(date);
  if (day === 0) return subDays(date, 2); // domingo -> sexta
  if (day === 6) return subDays(date, 1); // sábado -> sexta
  return date;
}

/**
 * Ajusta a data de vencimento baseado na regra de final de semana
 */
export function adjustDueDateForWeekend(
  date: Date,
  handling: WeekendHandling
): Date {
  if (!isWeekend(date)) return date;

  switch (handling) {
    case "advance":
      return getPreviousBusinessDay(date);
    case "postpone":
      return getNextBusinessDay(date);
    case "next_business_day":
      return getNextBusinessDay(date);
    default:
      return date;
  }
}

/**
 * Formata a data ajustada mostrando a original se houver diferença
 */
export function formatAdjustedDate(
  dueDate: Date,
  originalDate?: Date | null
): string {
  if (!originalDate) return format(dueDate, "dd/MM/yyyy");
  
  const dueDateStr = format(dueDate, "dd/MM/yyyy");
  const originalDateStr = format(originalDate, "dd/MM/yyyy");
  
  if (dueDateStr === originalDateStr) {
    return dueDateStr;
  }
  
  return `${dueDateStr} (orig: ${originalDateStr})`;
}

/**
 * Obtém o nome do dia da semana
 */
export function getWeekdayName(date: Date): string {
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return days[getDay(date)];
}
