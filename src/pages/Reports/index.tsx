import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/layout/PageHeader";
import { useDeadlines } from "@/hooks/useDeadlines";
import { useInstallments } from "@/hooks/useInstallments";
import { useClients } from "@/hooks/useClients";
import { exportToXLSX, exportToPDF, exportToCSV } from "@/lib/exportUtils";
import { useToast } from "@/hooks/use-toast";
import {
    FileText,
    FileSpreadsheet,
    Download,
    Calendar,
    Users,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Loader2,
} from "lucide-react";

export default function Reports() {
    const { toast } = useToast();
    const [clientFilter, setClientFilter] = useState("all");
    const [isExporting, setIsExporting] = useState<string | null>(null);

    const { deadlines, isLoading: loadingDeadlines } = useDeadlines({});
    const { installments, isLoading: loadingInstallments } = useInstallments();
    const { clients } = useClients({ pageSize: 1000 });

    // Filtrar por cliente se selecionado
    const filteredDeadlines = clientFilter === "all"
        ? deadlines
        : deadlines.filter(d => d.client_id === clientFilter);

    const filteredInstallments = clientFilter === "all"
        ? installments
        : installments.filter(i => i.client_id === clientFilter);

    // Estatísticas
    const stats = {
        totalDeadlines: filteredDeadlines.length,
        pending: filteredDeadlines.filter(d => d.status === 'pending').length,
        completed: filteredDeadlines.filter(d => d.status === 'completed').length,
        overdue: filteredDeadlines.filter(d => d.status === 'overdue').length,
        totalInstallments: filteredInstallments.length,
        paidInstallments: filteredInstallments.filter(i => i.status === 'paid').length,
        totalValue: filteredInstallments.reduce((sum, i) => sum + (i.amount || 0), 0),
    };

    const handleExport = async (type: 'pdf' | 'excel' | 'csv') => {
        setIsExporting(type);
        try {
            if (type === 'pdf') {
                exportToPDF(filteredDeadlines, filteredInstallments);
                toast({ title: "PDF exportado com sucesso!", description: "O arquivo foi baixado." });
            } else if (type === 'excel') {
                exportToXLSX(filteredDeadlines, filteredInstallments);
                toast({ title: "Excel exportado com sucesso!", description: "O arquivo foi baixado." });
            } else {
                exportToCSV(filteredDeadlines);
                toast({ title: "CSV exportado com sucesso!", description: "O arquivo foi baixado." });
            }
        } catch (error) {
            toast({ title: "Erro na exportação", description: "Tente novamente.", variant: "destructive" });
        } finally {
            setIsExporting(null);
        }
    };

    const isLoading = loadingDeadlines || loadingInstallments;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <PageHeader
                title="Relatórios"
                description="Exporte e visualize relatórios detalhados"
            />

            {/* Filtros */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filtros</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        <div className="w-full md:w-64">
                            <Select value={clientFilter} onValueChange={setClientFilter}>
                                <SelectTrigger>
                                    <Users className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Selecione o cliente" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os clientes</SelectItem>
                                    {clients.map(client => (
                                        <SelectItem key={client.id} value={client.id}>
                                            {client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Estatísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.totalDeadlines}</p>
                                <p className="text-sm text-muted-foreground">Total de Prazos</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900">
                                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.pending}</p>
                                <p className="text-sm text-muted-foreground">Pendentes</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.completed}</p>
                                <p className="text-sm text-muted-foreground">Concluídos</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
                                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.overdue}</p>
                                <p className="text-sm text-muted-foreground">Atrasados</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Opções de Exportação */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900">
                                <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <CardTitle>Relatório PDF</CardTitle>
                                <CardDescription>Documento formatado para impressão</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                            <li>• Resumo com estatísticas</li>
                            <li>• Tabela de prazos fiscais</li>
                            <li>• Tabela de parcelas</li>
                            <li>• Layout profissional</li>
                        </ul>
                        <Button
                            className="w-full"
                            onClick={() => handleExport('pdf')}
                            disabled={isLoading || isExporting !== null}
                        >
                            {isExporting === 'pdf' ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4 mr-2" />
                            )}
                            Exportar PDF
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900">
                                <FileSpreadsheet className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <CardTitle>Planilha Excel</CardTitle>
                                <CardDescription>Dados completos em XLSX</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                            <li>• Aba de prazos fiscais</li>
                            <li>• Aba de parcelas</li>
                            <li>• Aba de resumo</li>
                            <li>• Colunas formatadas</li>
                        </ul>
                        <Button
                            className="w-full"
                            variant="outline"
                            onClick={() => handleExport('excel')}
                            disabled={isLoading || isExporting !== null}
                        >
                            {isExporting === 'excel' ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4 mr-2" />
                            )}
                            Exportar Excel
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900">
                                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <CardTitle>Arquivo CSV</CardTitle>
                                <CardDescription>Dados para importação</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                            <li>• Formato universal</li>
                            <li>• Compatível com Excel</li>
                            <li>• Fácil integração</li>
                            <li>• Prazos fiscais</li>
                        </ul>
                        <Button
                            className="w-full"
                            variant="outline"
                            onClick={() => handleExport('csv')}
                            disabled={isLoading || isExporting !== null}
                        >
                            {isExporting === 'csv' ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4 mr-2" />
                            )}
                            Exportar CSV
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Info de Parcelas */}
            {stats.totalInstallments > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Resumo de Parcelas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold">{stats.totalInstallments}</p>
                                <p className="text-sm text-muted-foreground">Total</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-600">{stats.paidInstallments}</p>
                                <p className="text-sm text-muted-foreground">Pagas</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalValue)}
                                </p>
                                <p className="text-sm text-muted-foreground">Valor Total</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
