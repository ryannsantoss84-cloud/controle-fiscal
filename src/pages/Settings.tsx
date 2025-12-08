import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
    Settings as SettingsIcon,
    Save,
    Building,
    Palette,
    Bell,
    Database,
    Download,
    BarChart3,
    FileText,
    BellRing,
    Check,
    X
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useDeadlines } from "@/hooks/useDeadlines";
import { useInstallments } from "@/hooks/useInstallments";
import { useClients } from "@/hooks/useClients";
import { exportToXLSX } from "@/lib/exportUtils";
import { exportFullReportPDF } from "@/lib/pdfExport";
import { usePushNotifications } from "@/hooks/usePushNotifications";

interface SettingsData {
    office_name: string | null;
    office_document: string | null;
    default_weekend_handling: string | null;
    auto_create_recurrences: boolean | null;
}

export default function Settings() {
    const { toast } = useToast();
    const { theme, setTheme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("company");
    const [exporting, setExporting] = useState(false);

    // Buscar dados para exportação
    const { deadlines } = useDeadlines({ pageSize: 1000 });
    const { installments } = useInstallments({ pageSize: 1000 });
    const { clients } = useClients({ pageSize: 1000 });

    // Hook de notificações push
    const { permission, isSupported, requestPermission, sendNotification } = usePushNotifications();
    const [exportingPDF, setExportingPDF] = useState(false);

    const [settings, setSettings] = useState({
        office_name: "",
        office_document: "",
        office_address: "",
        office_phone: "",
        office_email: "",
        default_weekend_handling: "next_business_day",
        auto_create_recurrences: true,
        notification_days: 7,
        items_per_page: 25,
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const { data, error } = await supabase
                .from("settings")
                .select("*")
                .maybeSingle(); // Usar maybeSingle para evitar erro 406/JSON se vazio

            if (error) {
                throw error;
            }

            if (data) {
                const settingsData = data as unknown as SettingsData;
                setSettings({
                    office_name: settingsData.office_name || "",
                    office_document: settingsData.office_document || "",
                    office_address: localStorage.getItem("office_address") || "",
                    office_phone: localStorage.getItem("office_phone") || "",
                    office_email: localStorage.getItem("office_email") || "",
                    default_weekend_handling: settingsData.default_weekend_handling || "next_business_day",
                    auto_create_recurrences: settingsData.auto_create_recurrences ?? true,
                    notification_days: parseInt(localStorage.getItem("notification_days") || "7"),
                    items_per_page: parseInt(localStorage.getItem("items_per_page") || "25"),
                });
            } else {
                // Se não houver configurações, criar padrão
                const { error: createError } = await supabase
                    .from("settings")
                    .insert([{
                        office_name: "Meu Escritório",
                        default_weekend_handling: "next_business_day",
                        auto_create_recurrences: true,
                        notification_days_before: 7
                    }]);

                if (!createError) {
                    // Recarregar após criar
                    loadSettings();
                }
            }
        } catch (error: unknown) {
            console.error("Erro ao carregar configurações:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from("settings")
                .upsert({
                    office_name: settings.office_name,
                    office_document: settings.office_document,
                    default_weekend_handling: settings.default_weekend_handling,
                    auto_create_recurrences: settings.auto_create_recurrences,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;

            // Salvar outras configurações no localStorage
            localStorage.setItem("office_address", settings.office_address);
            localStorage.setItem("office_phone", settings.office_phone);
            localStorage.setItem("office_email", settings.office_email);
            localStorage.setItem("notification_days", settings.notification_days.toString());
            localStorage.setItem("items_per_page", settings.items_per_page.toString());

            toast({
                title: "Configurações salvas!",
                description: "Suas preferências foram atualizadas com sucesso.",
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
            toast({
                title: "Erro ao salvar",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleExportData = async () => {
        setExporting(true);
        try {
            const result = exportToXLSX(deadlines, installments, 'dados-fiscais');

            toast({
                title: "Exportação concluída!",
                description: `${result.deadlinesCount} prazos e ${result.installmentsCount} parcelas exportados para ${result.filename}`,
            });
        } catch (error) {
            console.error('Erro ao exportar:', error);
            toast({
                title: "Erro na exportação",
                description: "Não foi possível exportar os dados. Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Carregando...</div>;
    }

    return (
        <div className="space-y-6 max-w-4xl animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight gradient-text-primary flex items-center gap-2">
                    <SettingsIcon className="h-8 w-8" />
                    Configurações do Sistema
                </h1>
                <p className="text-muted-foreground mt-1">
                    Personalize o comportamento e dados do seu escritório
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="company" className="gap-2">
                        <Building className="h-4 w-4" />
                        Empresa
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="gap-2">
                        <Palette className="h-4 w-4" />
                        Aparência
                    </TabsTrigger>
                    <TabsTrigger value="automation" className="gap-2">
                        <SettingsIcon className="h-4 w-4" />
                        Automação
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-2">
                        <Bell className="h-4 w-4" />
                        Notificações
                    </TabsTrigger>
                    <TabsTrigger value="data" className="gap-2">
                        <Database className="h-4 w-4" />
                        Dados
                    </TabsTrigger>
                </TabsList>

                {/* ABA EMPRESA */}
                <TabsContent value="company" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dados do Escritório</CardTitle>
                            <CardDescription>
                                Informações utilizadas em relatórios e cabeçalhos
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="office_name">Nome do Escritório</Label>
                                    <Input
                                        id="office_name"
                                        placeholder="Ex: Silva Contabilidade"
                                        value={settings.office_name}
                                        onChange={(e) => setSettings({ ...settings, office_name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="office_document">CNPJ</Label>
                                    <Input
                                        id="office_document"
                                        placeholder="00.000.000/0000-00"
                                        value={settings.office_document}
                                        onChange={(e) => setSettings({ ...settings, office_document: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="office_address">Endereço</Label>
                                <Input
                                    id="office_address"
                                    placeholder="Rua, Número, Bairro, Cidade - UF"
                                    value={settings.office_address}
                                    onChange={(e) => setSettings({ ...settings, office_address: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="office_phone">Telefone</Label>
                                    <Input
                                        id="office_phone"
                                        placeholder="(00) 0000-0000"
                                        value={settings.office_phone}
                                        onChange={(e) => setSettings({ ...settings, office_phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="office_email">E-mail</Label>
                                    <Input
                                        id="office_email"
                                        type="email"
                                        placeholder="contato@escritorio.com"
                                        value={settings.office_email}
                                        onChange={(e) => setSettings({ ...settings, office_email: e.target.value })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ABA APARÊNCIA */}
                <TabsContent value="appearance" className="space-y-4" forceMount>
                    <Card>
                        <CardHeader>
                            <CardTitle>Preferências Visuais</CardTitle>
                            <CardDescription>
                                Personalize a aparência da interface
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <Label>Tema</Label>
                                <Select value={theme} onValueChange={setTheme}>
                                    <SelectTrigger className="w-full md:w-[300px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">Claro</SelectItem>
                                        <SelectItem value="dark">Escuro</SelectItem>
                                        <SelectItem value="system">Automático (Sistema)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-muted-foreground">
                                    O tema automático se ajusta baseado nas preferências do seu sistema
                                </p>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="items_per_page">Itens por Página</Label>
                                <Select
                                    value={settings.items_per_page.toString()}
                                    onValueChange={(value) =>
                                        setSettings({ ...settings, items_per_page: parseInt(value) })
                                    }
                                >
                                    <SelectTrigger id="items_per_page" className="w-full md:w-[300px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10 itens</SelectItem>
                                        <SelectItem value="25">25 itens</SelectItem>
                                        <SelectItem value="50">50 itens</SelectItem>
                                        <SelectItem value="100">100 itens</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ABA AUTOMAÇÃO */}
                <TabsContent value="automation" className="space-y-4" forceMount>
                    <Card>
                        <CardHeader>
                            <CardTitle>Regras de Automação</CardTitle>
                            <CardDescription>
                                Como o sistema deve calcular prazos automaticamente
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <Label htmlFor="weekend_handling">
                                    Quando um prazo cai no fim de semana
                                </Label>
                                <Select
                                    value={settings.default_weekend_handling}
                                    onValueChange={(value) =>
                                        setSettings({ ...settings, default_weekend_handling: value })
                                    }
                                >
                                    <SelectTrigger id="weekend_handling" className="w-full md:w-[400px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="next_business_day">Próximo dia útil (Segunda-feira)</SelectItem>
                                        <SelectItem value="advance">Antecipar (Sexta-feira anterior)</SelectItem>
                                        <SelectItem value="postpone">Postergar (Segunda-feira seguinte)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border">
                                    {settings.default_weekend_handling === "next_business_day" &&
                                        "ℹ️ Se cair no Sábado ou Domingo, o vencimento será na Segunda-feira seguinte."}
                                    {settings.default_weekend_handling === "advance" &&
                                        "ℹ️ Se cair no Sábado ou Domingo, o vencimento será na Sexta-feira anterior."}
                                    {settings.default_weekend_handling === "postpone" &&
                                        "ℹ️ Se cair no Sábado ou Domingo, o vencimento será na Segunda-feira seguinte."}
                                </p>
                            </div>

                            <div className="flex items-center justify-between border-t pt-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="auto_recurrence">
                                        Geração Automática Mensal
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Permitir que o sistema gere obrigações recorrentes automaticamente
                                    </p>
                                </div>
                                <Switch
                                    id="auto_recurrence"
                                    checked={settings.auto_create_recurrences}
                                    onCheckedChange={(checked) =>
                                        setSettings({ ...settings, auto_create_recurrences: checked })
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ABA NOTIFICAÇÕES */}
                <TabsContent value="notifications" className="space-y-4" forceMount>
                    <Card>
                        <CardHeader>
                            <CardTitle>Preferências de Notificações</CardTitle>
                            <CardDescription>
                                Configure quando e como ser notificado
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <Label htmlFor="notification_days">Dias de Antecedência para Alertas</Label>
                                <Select
                                    value={settings.notification_days.toString()}
                                    onValueChange={(value) =>
                                        setSettings({ ...settings, notification_days: parseInt(value) })
                                    }
                                >
                                    <SelectTrigger id="notification_days" className="w-full md:w-[300px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="3">3 dias antes</SelectItem>
                                        <SelectItem value="7">7 dias antes</SelectItem>
                                        <SelectItem value="15">15 dias antes</SelectItem>
                                        <SelectItem value="30">30 dias antes</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-muted-foreground">
                                    Você será alertado quando um prazo estiver próximo do vencimento
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notificações Push */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BellRing className="h-5 w-5" />
                                Notificações Push do Navegador
                            </CardTitle>
                            <CardDescription>
                                Receba alertas mesmo quando não estiver na página
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!isSupported ? (
                                <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                                    <X className="h-5 w-5 text-destructive" />
                                    <div>
                                        <p className="font-medium text-destructive">Não suportado</p>
                                        <p className="text-sm text-muted-foreground">
                                            Seu navegador não suporta notificações push.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            {permission === 'granted' ? (
                                                <div className="p-2 bg-green-500/10 rounded-full">
                                                    <Check className="h-5 w-5 text-green-600" />
                                                </div>
                                            ) : permission === 'denied' ? (
                                                <div className="p-2 bg-red-500/10 rounded-full">
                                                    <X className="h-5 w-5 text-red-600" />
                                                </div>
                                            ) : (
                                                <div className="p-2 bg-orange-500/10 rounded-full">
                                                    <Bell className="h-5 w-5 text-orange-600" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium">
                                                    Status: {permission === 'granted' ? 'Ativadas' :
                                                        permission === 'denied' ? 'Bloqueadas' : 'Não solicitado'}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {permission === 'granted' && 'Você receberá alertas sobre prazos importantes.'}
                                                    {permission === 'denied' && 'Habilite nas configurações do navegador.'}
                                                    {permission === 'default' && 'Clique para ativar as notificações.'}
                                                </p>
                                            </div>
                                        </div>
                                        {permission !== 'granted' && permission !== 'denied' && (
                                            <Button onClick={requestPermission} variant="outline" className="gap-2">
                                                <Bell className="h-4 w-4" />
                                                Ativar Notificações
                                            </Button>
                                        )}
                                    </div>

                                    {permission === 'granted' && (
                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <p className="font-medium">Testar Notificação</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Envie uma notificação de teste para verificar se está funcionando
                                                </p>
                                            </div>
                                            <Button
                                                onClick={() => {
                                                    sendNotification({
                                                        title: '🔔 Teste de Notificação',
                                                        body: 'As notificações estão funcionando corretamente!',
                                                    });
                                                    toast({
                                                        title: 'Notificação enviada!',
                                                        description: 'Verifique se a notificação apareceu.',
                                                    });
                                                }}
                                                variant="outline"
                                                className="gap-2"
                                            >
                                                <BellRing className="h-4 w-4" />
                                                Testar
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ABA DADOS */}
                <TabsContent value="data" className="space-y-4" forceMount>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Download className="h-5 w-5" />
                                Exportação de Dados
                            </CardTitle>
                            <CardDescription>
                                Faça backup ou exporte seus dados
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Exportar Excel */}
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <p className="font-medium">Exportar para Excel (XLSX)</p>
                                    <p className="text-sm text-muted-foreground">
                                        Arquivo formatado com todos os prazos e parcelas
                                    </p>
                                </div>
                                <Button
                                    onClick={handleExportData}
                                    variant="outline"
                                    className="gap-2"
                                    disabled={exporting}
                                >
                                    <Download className="h-4 w-4" />
                                    {exporting ? "Exportando..." : "Exportar XLSX"}
                                </Button>
                            </div>

                            {/* Exportar PDF */}
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <p className="font-medium">Exportar Relatório PDF</p>
                                    <p className="text-sm text-muted-foreground">
                                        Relatório completo formatado para impressão
                                    </p>
                                </div>
                                <Button
                                    onClick={async () => {
                                        setExportingPDF(true);
                                        try {
                                            const deadlinesForPDF = deadlines.map(d => ({
                                                id: d.id,
                                                title: d.title,
                                                type: d.type || 'obligation',
                                                client_name: d.clients?.name,
                                                due_date: d.due_date,
                                                status: d.status,
                                                sphere: d.sphere,
                                                responsible: d.responsible,
                                            }));

                                            const installmentsForPDF = installments.map(i => ({
                                                id: i.id,
                                                name: i.name || i.description,
                                                client_name: i.clients?.name,
                                                installment_number: i.installment_number,
                                                total_installments: i.total_installments,
                                                amount: i.amount,
                                                due_date: i.due_date,
                                                status: i.status,
                                                paid_at: i.paid_at,
                                            }));

                                            exportFullReportPDF(deadlinesForPDF, installmentsForPDF, {
                                                title: 'Relatório Fiscal Completo',
                                                officeName: settings.office_name || undefined,
                                                officeDocument: settings.office_document || undefined,
                                            });

                                            toast({
                                                title: "PDF exportado!",
                                                description: "O relatório foi baixado com sucesso.",
                                            });
                                        } catch (error) {
                                            console.error('Erro ao exportar PDF:', error);
                                            toast({
                                                title: "Erro na exportação",
                                                description: "Não foi possível gerar o PDF.",
                                                variant: "destructive",
                                            });
                                        } finally {
                                            setExportingPDF(false);
                                        }
                                    }}
                                    variant="outline"
                                    className="gap-2"
                                    disabled={exportingPDF}
                                >
                                    <FileText className="h-4 w-4" />
                                    {exportingPDF ? "Gerando..." : "Exportar PDF"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Estatísticas de Uso
                            </CardTitle>
                            <CardDescription>
                                Informações sobre o uso do sistema
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-4">
                                <div className="p-4 border rounded-lg bg-gradient-to-br from-primary/5 to-transparent">
                                    <p className="text-2xl font-bold text-primary">{clients.length}</p>
                                    <p className="text-sm text-muted-foreground">Total de Clientes</p>
                                </div>
                                <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-500/5 to-transparent">
                                    <p className="text-2xl font-bold text-blue-600">{deadlines.length}</p>
                                    <p className="text-sm text-muted-foreground">Total de Prazos</p>
                                </div>
                                <div className="p-4 border rounded-lg bg-gradient-to-br from-orange-500/5 to-transparent">
                                    <p className="text-2xl font-bold text-orange-600">
                                        {installments.filter(i => i.status === 'pending').length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Parcelas Pendentes</p>
                                </div>
                                <div className="p-4 border rounded-lg bg-gradient-to-br from-red-500/5 to-transparent">
                                    <p className="text-2xl font-bold text-red-600">
                                        {deadlines.filter(d => d.status === 'overdue').length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Prazos Atrasados</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSave} disabled={saving} className="min-w-[150px] gap-2">
                    <Save className="h-4 w-4" />
                    {saving ? "Salvando..." : "Salvar Alterações"}
                </Button>
            </div>
        </div>
    );
}
