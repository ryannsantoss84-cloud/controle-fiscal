import { format } from "date-fns";

export const HOLIDAYS = [
    // 2025
    "2025-01-01", // Confraternização Universal
    "2025-03-03", // Carnaval (Segunda)
    "2025-03-04", // Carnaval (Terça)
    "2025-04-18", // Paixão de Cristo
    "2025-04-20", // Páscoa
    "2025-04-21", // Tiradentes
    "2025-05-01", // Dia do Trabalho
    "2025-06-19", // Corpus Christi
    "2025-09-07", // Independência do Brasil
    "2025-10-12", // Nossa Senhora Aparecida
    "2025-11-02", // Finados
    "2025-11-15", // Proclamação da República
    "2025-11-20", // Dia da Consciência Negra
    "2025-12-25", // Natal

    // 2026
    "2026-01-01", // Confraternização Universal
    "2026-02-16", // Carnaval (Segunda)
    "2026-02-17", // Carnaval (Terça)
    "2026-04-03", // Paixão de Cristo
    "2026-04-05", // Páscoa
    "2026-04-21", // Tiradentes
    "2026-05-01", // Dia do Trabalho
    "2026-06-04", // Corpus Christi
    "2026-09-07", // Independência do Brasil
    "2026-10-12", // Nossa Senhora Aparecida
    "2026-11-02", // Finados
    "2026-11-15", // Proclamação da República
    "2026-11-20", // Dia da Consciência Negra
    "2026-12-25", // Natal
];

export function isHoliday(date: Date): boolean {
    const dateString = format(date, 'yyyy-MM-dd');
    return HOLIDAYS.includes(dateString);
}
