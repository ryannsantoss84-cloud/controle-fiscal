import { format } from "date-fns";

export interface Installment {
    id: string;
    client_id: string;
    installment_number: number;
    due_date: string;
    protocol?: string | null;
    name?: string | null;
}

export interface InstallmentDuplicationCheck {
    isDuplicate: boolean;
    level: 'exact' | 'protocol' | 'none';
    existingInstallment?: Installment;
    message: string;
}

/**
 * Verifica duplicação de parcelamentos:
 * 1. EXACT: Mesmo cliente + mesmo número de parcela + mesma data
 * 2. PROTOCOL: Mesmo cliente + mesmo protocolo (se fornecido)
 */
export function checkInstallmentDuplication(
    newInstallment: {
        client_id: string;
        installment_number: number;
        due_date: string;
        protocol?: string;
    },
    existingInstallments: Installment[]
): InstallmentDuplicationCheck {

    // Filtrar parcelas do mesmo cliente
    const sameClientInstallments = existingInstallments.filter(
        i => i.client_id === newInstallment.client_id
    );

    // NÍVEL 1: Duplicata Exata (mesmo cliente + número + data)
    const exactMatch = sameClientInstallments.find(i => {
        const existingDate = new Date(i.due_date);
        const newDate = new Date(newInstallment.due_date);

        return (
            i.installment_number === newInstallment.installment_number &&
            existingDate.getTime() === newDate.getTime()
        );
    });

    if (exactMatch) {
        return {
            isDuplicate: true,
            level: 'exact',
            existingInstallment: exactMatch,
            message: `Já existe a parcela ${exactMatch.installment_number} para este cliente com vencimento em ${format(new Date(exactMatch.due_date), 'dd/MM/yyyy')}.`
        };
    }

    // NÍVEL 2: Protocolo Duplicado (se fornecido)
    if (newInstallment.protocol && newInstallment.protocol.trim() !== '') {
        const protocolMatch = sameClientInstallments.find(i =>
            i.protocol &&
            i.protocol.trim().toLowerCase() === newInstallment.protocol!.trim().toLowerCase()
        );

        if (protocolMatch) {
            return {
                isDuplicate: true,
                level: 'protocol',
                existingInstallment: protocolMatch,
                message: `Já existe uma parcela com o protocolo "${protocolMatch.protocol}" para este cliente.`
            };
        }
    }

    return {
        isDuplicate: false,
        level: 'none',
        message: ''
    };
}
