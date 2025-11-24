export interface Client {
    id: string;
    name: string;
    cnpj: string;
}

export interface ClientDuplicationCheck {
    isDuplicate: boolean;
    level: 'cnpj' | 'name' | 'none';
    existingClient?: Client;
    message: string;
}

/**
 * Normaliza um nome removendo espaços extras e convertendo para minúsculas
 */
function normalizeName(name: string): string {
    return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Normaliza um CNPJ removendo caracteres especiais
 */
function normalizeCNPJ(cnpj: string): string {
    return cnpj.replace(/[^\d]/g, '');
}

/**
 * Verifica se dois nomes são muito similares
 */
function areNamesSimilar(name1: string, name2: string): boolean {
    const norm1 = normalizeName(name1);
    const norm2 = normalizeName(name2);

    // Se são exatamente iguais
    if (norm1 === norm2) return true;

    // Se um contém o outro (mínimo 5 caracteres)
    if (norm1.length >= 5 && norm2.length >= 5) {
        return norm1.includes(norm2) || norm2.includes(norm1);
    }

    return false;
}

/**
 * Verifica duplicação de clientes:
 * 1. CNPJ: Mesmo CNPJ (bloqueio total)
 * 2. NAME: Nome muito similar (alerta)
 */
export function checkClientDuplication(
    newClient: {
        name: string;
        cnpj: string;
    },
    existingClients: Client[]
): ClientDuplicationCheck {

    const normalizedCNPJ = normalizeCNPJ(newClient.cnpj);

    // NÍVEL 1: CNPJ Duplicado (bloqueio total)
    const cnpjMatch = existingClients.find(c =>
        normalizeCNPJ(c.cnpj) === normalizedCNPJ
    );

    if (cnpjMatch) {
        return {
            isDuplicate: true,
            level: 'cnpj',
            existingClient: cnpjMatch,
            message: `Já existe um cliente cadastrado com este CNPJ: "${cnpjMatch.name}".`
        };
    }

    // NÍVEL 2: Nome Similar (alerta)
    const nameMatch = existingClients.find(c =>
        areNamesSimilar(c.name, newClient.name)
    );

    if (nameMatch) {
        return {
            isDuplicate: true,
            level: 'name',
            existingClient: nameMatch,
            message: `Já existe um cliente com nome similar: "${nameMatch.name}" (CNPJ: ${nameMatch.cnpj}). Deseja criar mesmo assim?`
        };
    }

    return {
        isDuplicate: false,
        level: 'none',
        message: ''
    };
}
