import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Client } from "@/hooks/useClients";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClientReportButtonProps {
    client: Client;
    obligations: any[]; // Using any[] for now, ideally should be Obligation[]
}

export function ClientReportButton({ client, obligations }: ClientReportButtonProps) {
    const generatePDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text("Relatório Fiscal do Cliente", 14, 20);

        // Client Info
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Cliente: ${client.name}`, 14, 35);
        doc.text(`CNPJ/CPF: ${client.cnpj || "N/A"}`, 14, 42);
        doc.text(`Email: ${client.email || "N/A"}`, 14, 49);
        doc.text(`Data do Relatório: ${format(new Date(), "dd/MM/yyyy", { locale: ptBR })}`, 14, 56);

        // Summary Stats
        const total = obligations.length;
        const pending = obligations.filter(o => o.status === 'pending').length;
        const completed = obligations.filter(o => o.status === 'completed' || o.status === 'paid').length;
        const overdue = obligations.filter(o => o.status === 'overdue').length;

        doc.setDrawColor(200, 200, 200);
        doc.line(14, 65, 196, 65);

        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text("Resumo", 14, 75);

        doc.setFontSize(10);
        doc.text(`Total de Obrigações: ${total}`, 14, 85);
        doc.text(`Pendentes: ${pending}`, 60, 85);
        doc.text(`Concluídas: ${completed}`, 100, 85);
        doc.setTextColor(220, 53, 69); // Red for overdue
        doc.text(`Atrasadas: ${overdue}`, 140, 85);
        doc.setTextColor(100, 100, 100); // Reset color

        // Table
        const tableData = obligations.map(item => [
            item.title,
            format(new Date(item.due_date), "dd/MM/yyyy"),
            item.status === 'completed' ? 'Concluído' :
                item.status === 'paid' ? 'Pago' :
                    item.status === 'overdue' ? 'Atrasado' :
                        item.status === 'in_progress' ? 'Em Andamento' : 'Pendente',
            item.amount ? `R$ ${Number(item.amount).toFixed(2)}` : '-'
        ]);

        autoTable(doc, {
            startY: 95,
            head: [['Obrigação', 'Vencimento', 'Status', 'Valor']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [63, 81, 181] },
            styles: { fontSize: 9 },
            alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        // Footer
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(`Página ${i} de ${pageCount}`, 196, 285, { align: 'right' });
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
