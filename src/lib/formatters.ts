/**
 * Format a CNPJ (Brazilian company registration number)
 * Format: XX.XXX.XXX/XXXX-XX
 */
export function formatCNPJ(value: string): string {
    const numbers = value.replace(/\D/g, '');

    if (numbers.length === 0) return '';

    if (numbers.length <= 14) {
        return numbers
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2');
    }

    // Limit to 14 digits
    const limited = numbers.slice(0, 14);
    return limited
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
}

/**
 * Format a CPF (Brazilian individual registration number)
 * Format: XXX.XXX.XXX-XX
 */
export function formatCPF(value: string): string {
    const numbers = value.replace(/\D/g, '');

    if (numbers.length === 0) return '';

    if (numbers.length <= 11) {
        return numbers
            .replace(/^(\d{3})(\d)/, '$1.$2')
            .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1-$2');
    }

    // Limit to 11 digits
    const limited = numbers.slice(0, 11);
    return limited
        .replace(/^(\d{3})(\d)/, '$1.$2')
        .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

/**
 * Remove all formatting from a document string
 */
export function unformatDocument(value: string): string {
    return value.replace(/\D/g, '');
}

/**
 * Auto-detect and format CPF or CNPJ based on length
 */
export function formatDocument(value: string): string {
    const numbers = value.replace(/\D/g, '');

    if (numbers.length <= 11) {
        return formatCPF(value);
    } else {
        return formatCNPJ(value);
    }
}
