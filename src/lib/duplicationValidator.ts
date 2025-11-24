import { Deadline } from "@/hooks/useDeadlines";
import { format } from "date-fns";

export interface DuplicationCheck {
    isDuplicate: boolean;
    level: 'exact' | 'probable' | 'recurrence' | 'none';
    existingObligation?: Deadline;
    message: string;
}

/**
 * Normaliza um título removendo espaços extras e convertendo para minúsculas
 */
function normalizeTitle(title: string): string {
    return title.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Verifica se dois títulos são similares (um contém o outro)
 */
function areTitlesSimilar(title1: string, title2: string): boolean {
    const norm1 = normalizeTitle(title1);
    const norm2 = normalizeTitle(title2);

    // Se são exatamente iguais
    if (norm1 === norm2) return true;

    // Se um contém o outro (mínimo 4 caracteres para evitar falsos positivos)
    if (norm1.length >= 4 && norm2.length >= 4) {
        return norm1.includes(norm2) || norm2.includes(norm1);
    }

    return false;
}

/**
 * Verifica se duas datas estão no mesmo mês/ano
 */
function isSameMonth(date1: Date, date2: Date): boolean {
    return (
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
    );
}

/**
 * Verifica duplicação de obrigações em 3 níveis:
 * 1. EXACT: Título idêntico, mesmo mês/ano, mesmo cliente, mesmo tipo
 * 2. PROBABLE: Título similar, mesmo mês/ano, mesmo cliente
 * 3. RECURRENCE: Mesmo título/mês/ano/cliente, mas recorrência diferente
 */
export function checkDuplication(
    newObligation: {
        client_id: string;
        title: string;
        due_date: string | Date;
        type: string;
        recurrence?: string;
    },
    existingObligations: Deadline[]
): DuplicationCheck {

    const normalizedTitle = normalizeTitle(newObligation.title);
    const newDate = new Date(newObligation.due_date);
    const newMonth = newDate.getMonth() + 1;
    const newYear = newDate.getFullYear();

    // Buscar obrigações do mesmo cliente
    const sameClientObligations = existingObligations.filter(
        o => o.client_id === newObligation.client_id
    );

    // NÍVEL 1: Duplicata Exata
    const exactMatch = sameClientObligations.find(o => {
        const existingDate = new Date(o.due_date);

        return (
            normalizeTitle(o.title) === normalizedTitle &&
            isSameMonth(existingDate, newDate) &&
            o.type === newObligation.type
        );
    });

    if (exactMatch) {
        return {
            isDuplicate: true,
            level: 'exact',
            existingObligation: exactMatch,
            message: `Já existe uma obrigação "${exactMatch.title}" para este cliente em ${newMonth}/${newYear}.`
        };
    }

    // NÍVEL 2: Duplicata Provável (título similar)
    const similarMatch = sameClientObligations.find(o => {
        const existingDate = new Date(o.due_date);

        return (
            areTitlesSimilar(o.title, newObligation.title) &&
            isSameMonth(existingDate, newDate)
        );
    });

    if (similarMatch) {
        return {
            isDuplicate: true,
            level: 'probable',
            existingObligation: similarMatch,
            message: `Encontrada obrigação similar: "${similarMatch.title}" (${format(new Date(similarMatch.due_date), 'dd/MM/yyyy')}). Deseja criar mesmo assim?`
        };
    }

    // NÍVEL 3: Recorrência Conflitante
    if (newObligation.recurrence && newObligation.recurrence !== 'none') {
        const recurrenceConflict = sameClientObligations.find(o => {
            const existingDate = new Date(o.due_date);

            return (
                normalizeTitle(o.title) === normalizedTitle &&
                isSameMonth(existingDate, newDate) &&
                o.recurrence &&
                o.recurrence !== 'none' &&
                o.recurrence !== newObligation.recurrence
            );
        });

        if (recurrenceConflict) {
            const recurrenceLabels: Record<string, string> = {
                monthly: 'Mensal',
                quarterly: 'Trimestral',
                semiannual: 'Semestral',
                annual: 'Anual',
                none: 'Única'
            };

            return {
                isDuplicate: true,
                level: 'recurrence',
                existingObligation: recurrenceConflict,
                message: `Já existe "${recurrenceConflict.title}" com recorrência ${recurrenceLabels[recurrenceConflict.recurrence] || recurrenceConflict.recurrence}. Você está criando com recorrência ${recurrenceLabels[newObligation.recurrence] || newObligation.recurrence}.`
            };
        }
    }

    return {
        isDuplicate: false,
        level: 'none',
        message: ''
    };
}
