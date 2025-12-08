import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ============================================================================
// TIPOS
// ============================================================================
interface PDFExportOptions {
    title?: string;
    subtitle?: string;
    filename?: string;
    orientation?: 'portrait' | 'landscape';
    showLogo?: boolean;
    showTimestamp?: boolean;
    officeName?: string;
    officeDocument?: string;
}

interface DeadlineForPDF {
    id: string;
    title: string;
    type: string;
    client_name?: string;
    due_date: string;
    status: string;
    sphere?: string;
    description?: string;
    responsible?: string;
}

interface InstallmentForPDF {
    id: string;
    name?: string;
    client_name?: string;
    installment_number: number;
    total_installments: number;
    amount: number;
    due_date: string;
    status: string;
    paid_at?: string;
}

// ============================================================================
// HELPERS
// ============================================================================
function formatDateBR(dateString: string): string {
    try {
        const date = parseISO(dateString);
        return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch {
        return dateString || '-';
    }
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value || 0);
}

function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        pending: 'Pendente',
        in_progress: 'Em Andamento',
        completed: 'Concluído',
        overdue: 'Atrasado',
        paid: 'Pago',
    };
    return labels[status] || status;
}

function getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        tax: 'Imposto',
        obligation: 'Obrigação',
    };
    return labels[type] || type;
}

function getSphereLabel(sphere: string): string {
    const labels: Record<string, string> = {
        federal: 'Federal',
        state: 'Estadual',
        municipal: 'Municipal',
    };
    return labels[sphere] || sphere || '-';
}

// Cores para status
function getStatusColor(status: string): [number, number, number] {
    const colors: Record<string, [number, number, number]> = {
        pending: [59, 130, 246],     // Azul
        in_progress: [249, 115, 22], // Laranja
        completed: [34, 197, 94],    // Verde
        overdue: [239, 68, 68],      // Vermelho
        paid: [34, 197, 94],         // Verde
    };
    return colors[status] || [107, 114, 128]; // Cinza default
}

// ============================================================================
// EXPORTAR PRAZOS PARA PDF
// ============================================================================
export function exportDeadlinesToPDF(
    deadlines: DeadlineForPDF[],
    options: PDFExportOptions = {}
): void {
    const {
        title = 'Relatório de Prazos Fiscais',
        subtitle,
        filename = 'prazos-fiscais',
        orientation = 'landscape',
        showTimestamp = true,
        officeName,
        officeDocument,
    } = options;

    const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });

    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 15;

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235); // Azul primário
    doc.text(title, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;

    // Subtítulo (nome do escritório)
    if (officeName) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(officeName, pageWidth / 2, yPos, { align: 'center' });
        yPos += 5;
    }

    if (subtitle) {
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(subtitle, pageWidth / 2, yPos, { align: 'center' });
        yPos += 5;
    }

    // Timestamp
    if (showTimestamp) {
        doc.setFontSize(9);
        doc.setTextColor(130);
        const timestamp = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
        doc.text(`Gerado em: ${timestamp}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;
    }

    // Tabela de prazos
    const tableData = deadlines.map(d => [
        getTypeLabel(d.type),
        d.title,
        d.client_name || '-',
        formatDateBR(d.due_date),
        getSphereLabel(d.sphere || ''),
        getStatusLabel(d.status),
        d.responsible || '-',
    ]);

    autoTable(doc, {
        startY: yPos,
        head: [[
            'Tipo',
            'Título',
            'Cliente',
            'Vencimento',
            'Esfera',
            'Status',
            'Responsável',
        ]],
        body: tableData,
        theme: 'striped',
        headStyles: {
            fillColor: [37, 99, 235],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9,
        },
        bodyStyles: {
            fontSize: 8,
        },
        alternateRowStyles: {
            fillColor: [245, 247, 250],
        },
        columnStyles: {
            0: { cellWidth: 22 },  // Tipo
            1: { cellWidth: 'auto' }, // Título
            2: { cellWidth: 35 },  // Cliente
            3: { cellWidth: 25 },  // Vencimento
            4: { cellWidth: 22 },  // Esfera
            5: { cellWidth: 25 },  // Status
            6: { cellWidth: 30 },  // Responsável
        },
        didParseCell: (data) => {
            // Colorir célula de status
            if (data.section === 'body' && data.column.index === 5) {
                const status = deadlines[data.row.index]?.status;
                if (status) {
                    const color = getStatusColor(status);
                    data.cell.styles.textColor = color;
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        },
        margin: { left: 10, right: 10 },
    });

    // Resumo no rodapé
    const pendingCount = deadlines.filter(d => d.status === 'pending').length;
    const overdueCount = deadlines.filter(d => d.status === 'overdue').length;
    const completedCount = deadlines.filter(d => d.status === 'completed').length;

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text(
        `Total: ${deadlines.length} | Pendentes: ${pendingCount} | Atrasados: ${overdueCount} | Concluídos: ${completedCount}`,
        10,
        finalY
    );

    // Salvar
    const timestamp = format(new Date(), 'yyyy-MM-dd_HHmmss');
    doc.save(`${filename}_${timestamp}.pdf`);
}

// ============================================================================
// EXPORTAR PARCELAS PARA PDF
// ============================================================================
export function exportInstallmentsToPDF(
    installments: InstallmentForPDF[],
    options: PDFExportOptions = {}
): void {
    const {
        title = 'Relatório de Parcelamentos',
        subtitle,
        filename = 'parcelamentos',
        orientation = 'landscape',
        showTimestamp = true,
        officeName,
    } = options;

    const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });

    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 15;

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text(title, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;

    if (officeName) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(officeName, pageWidth / 2, yPos, { align: 'center' });
        yPos += 5;
    }

    if (subtitle) {
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(subtitle, pageWidth / 2, yPos, { align: 'center' });
        yPos += 5;
    }

    if (showTimestamp) {
        doc.setFontSize(9);
        doc.setTextColor(130);
        const timestamp = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
        doc.text(`Gerado em: ${timestamp}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;
    }

    // Tabela
    const tableData = installments.map(i => [
        i.name || '-',
        i.client_name || '-',
        `${i.installment_number}/${i.total_installments}`,
        formatCurrency(i.amount),
        formatDateBR(i.due_date),
        i.paid_at ? formatDateBR(i.paid_at) : '-',
        getStatusLabel(i.status),
    ]);

    autoTable(doc, {
        startY: yPos,
        head: [[
            'Descrição',
            'Cliente',
            'Parcela',
            'Valor',
            'Vencimento',
            'Pago em',
            'Status',
        ]],
        body: tableData,
        theme: 'striped',
        headStyles: {
            fillColor: [37, 99, 235],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9,
        },
        bodyStyles: {
            fontSize: 8,
        },
        alternateRowStyles: {
            fillColor: [245, 247, 250],
        },
        columnStyles: {
            0: { cellWidth: 'auto' }, // Descrição
            1: { cellWidth: 35 },     // Cliente
            2: { cellWidth: 20 },     // Parcela
            3: { cellWidth: 28, halign: 'right' }, // Valor
            4: { cellWidth: 25 },     // Vencimento
            5: { cellWidth: 25 },     // Pago em
            6: { cellWidth: 22 },     // Status
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 6) {
                const status = installments[data.row.index]?.status;
                if (status) {
                    const color = getStatusColor(status);
                    data.cell.styles.textColor = color;
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        },
        margin: { left: 10, right: 10 },
    });

    // Resumo
    const totalAmount = installments.reduce((sum, i) => sum + (i.amount || 0), 0);
    const paidAmount = installments
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + (i.amount || 0), 0);
    const pendingAmount = totalAmount - paidAmount;

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text(
        `Total: ${formatCurrency(totalAmount)} | Pago: ${formatCurrency(paidAmount)} | Pendente: ${formatCurrency(pendingAmount)}`,
        10,
        finalY
    );

    // Salvar
    const timestamp = format(new Date(), 'yyyy-MM-dd_HHmmss');
    doc.save(`${filename}_${timestamp}.pdf`);
}

// ============================================================================
// EXPORTAR RELATÓRIO COMPLETO
// ============================================================================
export function exportFullReportPDF(
    deadlines: DeadlineForPDF[],
    installments: InstallmentForPDF[],
    options: PDFExportOptions = {}
): void {
    const {
        title = 'Relatório Fiscal Completo',
        filename = 'relatorio-fiscal',
        orientation = 'landscape',
        showTimestamp = true,
        officeName,
        officeDocument,
    } = options;

    const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });

    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 15;

    // Header principal
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text(title, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    if (officeName) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60);
        doc.text(officeName, pageWidth / 2, yPos, { align: 'center' });
        yPos += 5;

        if (officeDocument) {
            doc.setFontSize(10);
            doc.text(`CNPJ: ${officeDocument}`, pageWidth / 2, yPos, { align: 'center' });
            yPos += 5;
        }
    }

    if (showTimestamp) {
        doc.setFontSize(9);
        doc.setTextColor(130);
        const timestamp = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
        doc.text(`Gerado em: ${timestamp}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 12;
    }

    // Seção: Resumo Geral
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('Resumo Geral', 10, yPos);
    yPos += 8;

    const summaryData = [
        ['Total de Prazos', String(deadlines.length)],
        ['Prazos Pendentes', String(deadlines.filter(d => d.status === 'pending').length)],
        ['Prazos Atrasados', String(deadlines.filter(d => d.status === 'overdue').length)],
        ['Prazos Concluídos', String(deadlines.filter(d => d.status === 'completed').length)],
        ['', ''],
        ['Total de Parcelas', String(installments.length)],
        ['Parcelas Pendentes', String(installments.filter(i => i.status === 'pending').length)],
        ['Parcelas Pagas', String(installments.filter(i => i.status === 'paid').length)],
        ['', ''],
        ['Valor Total Parcelas', formatCurrency(installments.reduce((s, i) => s + (i.amount || 0), 0))],
        ['Valor Pago', formatCurrency(installments.filter(i => i.status === 'paid').reduce((s, i) => s + (i.amount || 0), 0))],
        ['Valor Pendente', formatCurrency(installments.filter(i => i.status !== 'paid').reduce((s, i) => s + (i.amount || 0), 0))],
    ];

    autoTable(doc, {
        startY: yPos,
        body: summaryData,
        theme: 'plain',
        bodyStyles: { fontSize: 10 },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 50 },
            1: { halign: 'left', cellWidth: 40 },
        },
        margin: { left: 10 },
    });

    // Nova página para prazos
    doc.addPage();
    yPos = 15;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('Prazos Fiscais', 10, yPos);
    yPos += 8;

    const deadlinesTableData = deadlines.map(d => [
        getTypeLabel(d.type),
        d.title.substring(0, 40) + (d.title.length > 40 ? '...' : ''),
        d.client_name || '-',
        formatDateBR(d.due_date),
        getStatusLabel(d.status),
    ]);

    autoTable(doc, {
        startY: yPos,
        head: [['Tipo', 'Título', 'Cliente', 'Vencimento', 'Status']],
        body: deadlinesTableData,
        theme: 'striped',
        headStyles: {
            fillColor: [37, 99, 235],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9,
        },
        bodyStyles: { fontSize: 8 },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 4) {
                const status = deadlines[data.row.index]?.status;
                if (status) {
                    data.cell.styles.textColor = getStatusColor(status);
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        },
        margin: { left: 10, right: 10 },
    });

    // Nova página para parcelas se houver
    if (installments.length > 0) {
        doc.addPage();
        yPos = 15;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(37, 99, 235);
        doc.text('Parcelamentos', 10, yPos);
        yPos += 8;

        const installmentsTableData = installments.map(i => [
            i.name || '-',
            i.client_name || '-',
            `${i.installment_number}/${i.total_installments}`,
            formatCurrency(i.amount),
            formatDateBR(i.due_date),
            getStatusLabel(i.status),
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [['Descrição', 'Cliente', 'Parcela', 'Valor', 'Vencimento', 'Status']],
            body: installmentsTableData,
            theme: 'striped',
            headStyles: {
                fillColor: [37, 99, 235],
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 9,
            },
            bodyStyles: { fontSize: 8 },
            columnStyles: {
                3: { halign: 'right' },
            },
            didParseCell: (data) => {
                if (data.section === 'body' && data.column.index === 5) {
                    const status = installments[data.row.index]?.status;
                    if (status) {
                        data.cell.styles.textColor = getStatusColor(status);
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
            },
            margin: { left: 10, right: 10 },
        });
    }

    // Salvar
    const timestamp = format(new Date(), 'yyyy-MM-dd_HHmmss');
    doc.save(`${filename}_${timestamp}.pdf`);
}
