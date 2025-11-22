import { addDays, subDays, getDay, format } from "date-fns";
import { isHoliday } from "./holidays";

export type WeekendHandling = "advance" | "postpone" | "next_business_day";

/**
 * Verifica se uma data cai no final de semana ou feriado
 */
export function isWeekend(date: Date): boolean {
  const day = getDay(date);
  return day === 0 || day === 6 || isHoliday(date); // 0 = domingo, 6 = sábado, ou feriado
}

/**
 * Obtém o próximo dia útil (pula finais de semana e feriados)
 */
export function getNextBusinessDay(date: Date): Date {
  let current = date;
  // Enquanto for sábado (6), domingo (0) ou feriado, avança 1 dia
  while (getDay(current) === 0 || getDay(current) === 6 || isHoliday(current)) {
    current = addDays(current, 1);
  }
  return current;
}

/**
 * Obtém o dia útil anterior (pula finais de semana e feriados)
 */
export function getPreviousBusinessDay(date: Date): Date {
  let current = date;
  // Enquanto for sábado (6), domingo (0) ou feriado, volta 1 dia
  while (getDay(current) === 0 || getDay(current) === 6 || isHoliday(current)) {
    current = subDays(current, 1);
  }
  return current;
}

/**
 * Ajusta a data de vencimento baseado na regra de final de semana/feriado
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
