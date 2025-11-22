import { addMonths, startOfMonth, getMonth, format, getQuarter } from "date-fns";
import { ptBR } from "date-fns/locale";

export type RecurrenceType = "none" | "monthly" | "quarterly" | "semiannual" | "annual";

export const FiscalIntelligence = {
    /**
     * Calcula a descrição da competência baseada na data e recorrência.
     * Ex: Mensal -> "jan/2024"
     *     Trimestral -> "1º Trim/2024"
     */
    formatReferenceDate: (date: Date, recurrence: RecurrenceType): string => {
        if (recurrence === "quarterly") {
            const quarter = getQuarter(date);
            return `${quarter}º Trim/${format(date, "yyyy")}`;
        } else if (recurrence === "semiannual") {
            const month = getMonth(date);
            const semester = month < 6 ? 1 : 2;
            return `${semester}º Sem/${format(date, "yyyy")}`;
        } else if (recurrence === "annual") {
            return format(date, "yyyy");
        } else {
            // Padrão Mensal
            return format(date, "MMM/yyyy", { locale: ptBR });
        }
    },

    /**
     * Gera as próximas datas de vencimento baseadas na regra de recorrência.
     */
    generateNextOccurrences: (baseDate: Date, recurrence: RecurrenceType, count: number = 12): Date[] => {
        const dates: Date[] = [];
        let currentDate = new Date(baseDate);

        // Se for trimestral, ajusta para o próximo trimestre civil se necessário?
        // Por enquanto, vamos apenas somar a periodicidade simples.

        for (let i = 0; i < count; i++) {
            let increment = 0;
            switch (recurrence) {
                case "monthly": increment = 1; break;
                case "quarterly": increment = 3; break;
                case "semiannual": increment = 6; break;
                case "annual": increment = 12; break;
                default: increment = 0;
            }

            if (increment > 0) {
                currentDate = addMonths(currentDate, increment);
                dates.push(new Date(currentDate));
            }
        }
        return dates;
    },

    /**
     * Verifica se o mês atual é válido para uma obrigação trimestral.
     * Geralmente obrigações trimestrais vencem no mês seguinte ao fechamento do trimestre.
     * Trimestres: Jan-Mar (Vence Abr), Abr-Jun (Vence Jul), Jul-Set (Vence Out), Out-Dez (Vence Jan)
     */
    isQuarterlyDueDate: (date: Date): boolean => {
        const month = getMonth(date); // 0-indexed
        // Meses de vencimento trimestral comum: Abril (3), Julho (6), Outubro (9), Janeiro (0)
        return [0, 3, 6, 9].includes(month);
    }
};
