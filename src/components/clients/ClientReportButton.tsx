import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Client } from "@/hooks/useClients";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClientReportButtonProps {
    client: Client;
    obligations: any[];
}

export function ClientReportButton({ client, obligations }: ClientReportButtonProps) {
    const generatePDF = () => {
        const doc = new jsPDF();

        // Header Background
        doc.setFillColor(63, 81, 181); // Primary Color
        doc.rect(0, 0, 210, 40, 'F');

        // Title
        doc.setFontSize(24);
        doc.setTextColor(255, 255, 255);
        doc.text("Relatório Fiscal", 14, 25);

        // Date in Header
        doc.setFontSize(10);
        doc.text(format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }), 196, 25, { align: 'right' });

        // Client Info Card
        doc.setDrawColor(220, 220, 220);
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(14, 50, 182, 35, 3, 3, 'FD');

        doc.setFontSize(14);
        doc.setTextColor(63, 81, 181);
        doc.text(client.name, 20, 62);

        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(`CNPJ/CPF: ${client.cnpj || "N/A"}`, 20, 70);
        doc.text(`Email: ${client.email || "N/A"}`, 20, 76);
        doc.text(`Regime: ${client.tax_regime ? client.tax_regime.replace('_', ' ').toUpperCase() : "N/A"}`, 100, 70);

        item.status === 'paid' ? 'Pago' :
            item.status === 'overdue' ? 'Atrasado' :
                item.status === 'in_progress' ? 'Em Andamento' : 'Pendente'
        ]);

    autoTable(doc, {
        startY: 125,
        head: [['Obrigação', 'Vencimento', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: [63, 81, 181],
            fontSize: 10,
            halign: 'center'
        },
        styles: {
            fontSize: 9,
            cellPadding: 3,
        },
        columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 40, halign: 'center' },
            2: { cellWidth: 40, halign: 'center' }
        },
        alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Gerado por Control Fiscal - Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
    }

    doc.save(`relatorio_${client.name.replace(/\s+/g, '_').toLowerCase()}_${format(new Date(), "yyyyMMdd")}.pdf`);
};

return (
    <Button onClick={generatePDF} variant="outline" className="gap-2">
        <FileDown className="h-4 w-4" />
        Gerar Relatório
    </Button>
);
}
