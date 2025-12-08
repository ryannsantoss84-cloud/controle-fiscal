import {
    Clock,
    CheckCircle2,
    AlertCircle,
    Play,
    Pause,
    Ban,
    CircleDot
} from "lucide-react";

// ============================================================================
// STATUS DE OBRIGAÇÕES/PRAZOS
// ============================================================================
export const OBLIGATION_STATUS = {
    pending: {
        label: 'Pendente',
        color: 'blue',
        bgColor: 'bg-blue-500/10',
        textColor: 'text-blue-700 dark:text-blue-400',
        borderColor: 'border-blue-500/20',
        icon: Clock,
    },
    in_progress: {
        label: 'Em Andamento',
        color: 'orange',
        bgColor: 'bg-orange-500/10',
        textColor: 'text-orange-700 dark:text-orange-400',
        borderColor: 'border-orange-500/20',
        icon: Play,
    },
    completed: {
        label: 'Concluído',
        color: 'green',
        bgColor: 'bg-green-500/10',
        textColor: 'text-green-700 dark:text-green-400',
        borderColor: 'border-green-500/20',
        icon: CheckCircle2,
    },
    overdue: {
        label: 'Atrasado',
        color: 'red',
        bgColor: 'bg-red-500/10',
        textColor: 'text-red-700 dark:text-red-400',
        borderColor: 'border-red-500/20',
        icon: AlertCircle,
    },
} as const;

export type ObligationStatusKey = keyof typeof OBLIGATION_STATUS;

// ============================================================================
// STATUS DE PARCELAS
// ============================================================================
export const INSTALLMENT_STATUS = {
    pending: {
        label: 'Pendente',
        color: 'blue',
        bgColor: 'bg-blue-500/10',
        textColor: 'text-blue-700 dark:text-blue-400',
        borderColor: 'border-blue-500/20',
        icon: Clock,
    },
    paid: {
        label: 'Pago',
        color: 'green',
        bgColor: 'bg-green-500/10',
        textColor: 'text-green-700 dark:text-green-400',
        borderColor: 'border-green-500/20',
        icon: CheckCircle2,
    },
    overdue: {
        label: 'Atrasado',
        color: 'red',
        bgColor: 'bg-red-500/10',
        textColor: 'text-red-700 dark:text-red-400',
        borderColor: 'border-red-500/20',
        icon: AlertCircle,
    },
    cancelled: {
        label: 'Cancelado',
        color: 'gray',
        bgColor: 'bg-gray-500/10',
        textColor: 'text-gray-700 dark:text-gray-400',
        borderColor: 'border-gray-500/20',
        icon: Ban,
    },
} as const;

export type InstallmentStatusKey = keyof typeof INSTALLMENT_STATUS;

// ============================================================================
// TIPOS DE OBRIGAÇÕES
// ============================================================================
export const OBLIGATION_TYPES = {
    obligation: {
        label: 'Obrigação',
        color: 'purple',
        bgColor: 'bg-purple-500/10',
        textColor: 'text-purple-700 dark:text-purple-400',
        borderColor: 'border-purple-500/20',
    },
    tax: {
        label: 'Imposto',
        color: 'amber',
        bgColor: 'bg-amber-500/10',
        textColor: 'text-amber-700 dark:text-amber-400',
        borderColor: 'border-amber-500/20',
    },
} as const;

export type ObligationTypeKey = keyof typeof OBLIGATION_TYPES;

// ============================================================================
// ESFERAS/JURISDIÇÕES
// ============================================================================
export const JURISDICTIONS = {
    federal: {
        label: 'Federal',
        color: 'indigo',
        bgColor: 'bg-indigo-500/10',
        textColor: 'text-indigo-700 dark:text-indigo-400',
        borderColor: 'border-indigo-500/20',
    },
    state: {
        label: 'Estadual',
        color: 'cyan',
        bgColor: 'bg-cyan-500/10',
        textColor: 'text-cyan-700 dark:text-cyan-400',
        borderColor: 'border-cyan-500/20',
    },
    municipal: {
        label: 'Municipal',
        color: 'teal',
        bgColor: 'bg-teal-500/10',
        textColor: 'text-teal-700 dark:text-teal-400',
        borderColor: 'border-teal-500/20',
    },
} as const;

export type JurisdictionKey = keyof typeof JURISDICTIONS;

// ============================================================================
// RECORRÊNCIA
// ============================================================================
export const RECURRENCE_TYPES = {
    none: { label: 'Única', shortLabel: 'Única' },
    monthly: { label: 'Mensal', shortLabel: 'Mensal' },
    quarterly: { label: 'Trimestral', shortLabel: 'Trim.' },
    semiannual: { label: 'Semestral', shortLabel: 'Sem.' },
    annual: { label: 'Anual', shortLabel: 'Anual' },
} as const;

export type RecurrenceTypeKey = keyof typeof RECURRENCE_TYPES;

// ============================================================================
// REGIMES TRIBUTÁRIOS
// ============================================================================
export const TAX_REGIMES = {
    simples_nacional: {
        label: 'Simples Nacional',
        shortLabel: 'SN',
        color: 'green',
    },
    lucro_presumido: {
        label: 'Lucro Presumido',
        shortLabel: 'LP',
        color: 'blue',
    },
    lucro_real: {
        label: 'Lucro Real',
        shortLabel: 'LR',
        color: 'purple',
    },
    mei: {
        label: 'MEI',
        shortLabel: 'MEI',
        color: 'orange',
    },
} as const;

export type TaxRegimeKey = keyof typeof TAX_REGIMES;

// ============================================================================
// TRATAMENTO DE FINAL DE SEMANA
// ============================================================================
export const WEEKEND_HANDLING = {
    postpone: { label: 'Adiar para próximo dia útil' },
    anticipate: { label: 'Antecipar para dia útil anterior' },
    keep: { label: 'Manter no final de semana' },
} as const;

export type WeekendHandlingKey = keyof typeof WEEKEND_HANDLING;

// ============================================================================
// HELPERS
// ============================================================================
export function getStatusConfig(status: string, type: 'obligation' | 'installment' = 'obligation') {
    if (type === 'installment') {
        return INSTALLMENT_STATUS[status as InstallmentStatusKey] || INSTALLMENT_STATUS.pending;
    }
    return OBLIGATION_STATUS[status as ObligationStatusKey] || OBLIGATION_STATUS.pending;
}

export function getTypeConfig(type: string) {
    return OBLIGATION_TYPES[type as ObligationTypeKey] || OBLIGATION_TYPES.obligation;
}

export function getJurisdictionConfig(jurisdiction: string) {
    return JURISDICTIONS[jurisdiction as JurisdictionKey] || JURISDICTIONS.federal;
}

export function getRecurrenceLabel(recurrence: string) {
    return RECURRENCE_TYPES[recurrence as RecurrenceTypeKey]?.label || recurrence;
}

export function getTaxRegimeConfig(regime: string) {
    return TAX_REGIMES[regime as TaxRegimeKey] || { label: regime, shortLabel: regime, color: 'gray' };
}
