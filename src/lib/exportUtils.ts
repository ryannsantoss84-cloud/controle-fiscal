import * as XLSX from 'xlsx';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata data para padrão brasileiro
 */
export function formatDateBR(dateString: string): string {
    try {
        const date = parseISO(dateString);
        return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch {
        return dateString;
    }
}

/**
 * Formata valor monetário para padrão brasileiro
 */
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

/**
 * Traduz status de prazo para português
 */
export function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        pending: 'Pendente',
        completed: 'Concluído',
        overdue: 'Atrasado',
    };
    return labels[status] || status;
}

/**
 * Traduz status de parcela para português
 */
export function getInstallmentStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        pending: 'Pendente',
        paid: 'Pago',
        overdue: 'Atrasado',
    };
    return labels[status] || status;
}

/**
 * Traduz tipo de prazo para português
 */
export function getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        tax: 'Imposto',
        obligation: 'Obrigação',
    };
    return labels[type] || type;
}

/**
 * Traduz jurisdição para português
 */
export function getJurisdictionLabel(jurisdiction: string): string {
    const labels: Record<string, string> = {
        federal: 'Federal',
        state: 'Estadual',
        municipal: 'Municipal',
    };
    return labels[jurisdiction] || jurisdiction;
}

/**
 * Formata minutos para formato legível (ex: "2h 30min", "3d 5h")
 */
export function formatTimeMinutes(minutes: number | null | undefined): string {
    if (!minutes || minutes === 0) return '-';

    if (minutes < 60) {
        return `${Math.round(minutes)}min`;
    }

    if (minutes < 1440) { // Menos de 1 dia
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }

    // 1 dia ou mais
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
}

/**
 * Exporta dados para arquivo XLSX com formatação profissional
 */
export function exportToXLSX(
    deadlines: any[],
    installments: any[],
    filename: string = 'dados-fiscais'
) {
    // Criar novo workbook
    const wb = XLSX.utils.book_new();

    // ===== ABA 1: PRAZOS FISCAIS =====
    if (deadlines.length > 0) {
        const deadlinesData = deadlines.map(d => ({
            'Tipo': getTypeLabel(d.type),
            'Título': d.title,
            'Cliente': d.client_name || '-',
            'Data de Vencimento': formatDateBR(d.due_date),
            'Data de Criação': formatDateBR(d.created_at),
            'Data de Conclusão': d.completed_at ? formatDateBR(d.completed_at) : '-',
            'Tempo Gasto': formatTimeMinutes(d.time_spent_minutes),
            'Status': getStatusLabel(d.status),
            'Jurisdição': getJurisdictionLabel(d.jurisdiction),
            'Recorrente': d.is_recurring ? 'Sim' : 'Não',
            'Descrição': d.description || '-',
        }));

        const ws1 = XLSX.utils.json_to_sheet(deadlinesData);

        // Definir larguras das colunas
        ws1['!cols'] = [
            { wch: 12 },  // Tipo
            { wch: 35 },  // Título
            { wch: 25 },  // Cliente
            { wch: 18 },  // Data de Vencimento
            { wch: 18 },  // Data de Criação
            { wch: 18 },  // Data de Conclusão
            { wch: 15 },  // Tempo Gasto
            { wch: 12 },  // Status
            { wch: 12 },  // Jurisdição
            { wch: 12 },  // Recorrente
            { wch: 40 },  // Descrição
        ];

        XLSX.utils.book_append_sheet(wb, ws1, 'Prazos Fiscais');
    }

    // ===== ABA 2: PARCELAS =====
    if (installments.length > 0) {
        const installmentsData = installments.map(i => ({
            'Descrição': i.description,
            'Cliente': i.client_name || '-',
            'Parcela': `${i.installment_number}/${i.total_installments}`,
            'Valor': i.amount,
            'Data de Vencimento': formatDateBR(i.due_date),
            'Data de Criação': formatDateBR(i.created_at),
            'Data de Pagamento': i.paid_at ? formatDateBR(i.paid_at) : '-',
            'Tempo até Pagamento': formatTimeMinutes(i.time_to_payment_minutes),
            'Status': getInstallmentStatusLabel(i.status),
            'Observações': i.notes || '-',
        }));

        const ws2 = XLSX.utils.json_to_sheet(installmentsData);

        // Definir larguras das colunas
        ws2['!cols'] = [
            { wch: 35 },  // Descrição
            { wch: 25 },  // Cliente
            { wch: 10 },  // Parcela
            { wch: 15 },  // Valor
            { wch: 18 },  // Data de Vencimento
            { wch: 18 },  // Data de Criação
            { wch: 18 },  // Data de Pagamento
            { wch: 18 },  // Tempo até Pagamento
            { wch: 12 },  // Status
            { wch: 40 },  // Observações
        ];

        // Formatar coluna de valores como moeda
        const range = XLSX.utils.decode_range(ws2['!ref'] || 'A1');
        for (let R = range.s.r + 1; R <= range.e.r; ++R) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: 3 }); // Coluna D (Valor)
            if (ws2[cellAddress]) {
                ws2[cellAddress].z = 'R$ #,##0.00';
                ws2[cellAddress].t = 'n';
            }
        }

        XLSX.utils.book_append_sheet(wb, ws2, 'Parcelas');
    }

    // ===== ABA 3: RESUMO =====
    const summaryData = [
        { 'Categoria': 'Total de Prazos Fiscais', 'Quantidade': deadlines.length },
        { 'Categoria': 'Prazos Pendentes', 'Quantidade': deadlines.filter(d => d.status === 'pending').length },
        { 'Categoria': 'Prazos Concluídos', 'Quantidade': deadlines.filter(d => d.status === 'completed').length },
        { 'Categoria': 'Prazos Atrasados', 'Quantidade': deadlines.filter(d => d.status === 'overdue').length },
        { 'Categoria': '', 'Quantidade': '' },
        { 'Categoria': 'Total de Parcelas', 'Quantidade': installments.length },
        { 'Categoria': 'Parcelas Pendentes', 'Quantidade': installments.filter(i => i.status === 'pending').length },
        { 'Categoria': 'Parcelas Pagas', 'Quantidade': installments.filter(i => i.status === 'paid').length },
        { 'Categoria': 'Parcelas Atrasadas', 'Quantidade': installments.filter(i => i.status === 'overdue').length },
        { 'Categoria': '', 'Quantidade': '' },
        { 'Categoria': 'Valor Total de Parcelas', 'Quantidade': formatCurrency(installments.reduce((sum, i) => sum + i.amount, 0)) },
        { 'Categoria': 'Valor Pago', 'Quantidade': formatCurrency(installments.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0)) },
        { 'Categoria': 'Valor Pendente', 'Quantidade': formatCurrency(installments.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0)) },
    ];

    const ws3 = XLSX.utils.json_to_sheet(summaryData);
    ws3['!cols'] = [
        { wch: 30 },  // Categoria
        { wch: 20 },  // Quantidade
    ];

    XLSX.utils.book_append_sheet(wb, ws3, 'Resumo');

    // Gerar timestamp para nome do arquivo
    const timestamp = format(new Date(), 'yyyy-MM-dd_HHmmss');
    const finalFilename = `${filename}_${timestamp}.xlsx`;

    // Salvar arquivo
    XLSX.writeFile(wb, finalFilename);

    return {
        filename: finalFilename,
        deadlinesCount: deadlines.length,
        installmentsCount: installments.length,
    };
}
