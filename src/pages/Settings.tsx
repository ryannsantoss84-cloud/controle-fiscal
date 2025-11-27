import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Settings as SettingsIcon, Save, Moon, Sun, Building } from "lucide-react";
import { useTheme } from "next-themes";
import { NotificationSettings } from "@/components/notifications/NotificationSettings";

interface SettingsData {
    office_name: string | null;
    office_document: string | null;
    default_weekend_handling: string | null;
    auto_create_recurrences: boolean | null;
}

export default function Settings() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    // const { setTheme, theme } = useTheme(); // Comentado pois preciso verificar se next-themes está instalado, se não, farei manual.

    const [settings, setSettings] = useState({
        office_name: "",
        office_document: "",
        default_weekend_handling: "next_business_day",
        auto_create_recurrences: true,
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const { data, error } = await supabase
                .from("settings")
                .select("*")
                .single();

            if (error && error.code !== "PGRST116") {
                throw error;
            }

            if (data) {
                const settingsData = data as SettingsData;
                setSettings({
                    office_name: settingsData.office_name || "",
                    office_document: settingsData.office_document || "",
                    default_weekend_handling: settingsData.default_weekend_handling || "next_business_day",
                    auto_create_recurrences: settingsData.auto_create_recurrences ?? true,
                });
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
            // Verifica se existe registro, se não cria um dummy ID ou usa single row logic
            // Assumindo que a tabela settings tem uma constraint de single row ou RLS que garante 1 row por user/tenant
            const { error } = await supabase
                .from("settings")
                .upsert({
                    // id: 1, // Se for tabela singleton
                    office_name: settings.office_name,
                    office_document: settings.office_document,
                    default_weekend_handling: settings.default_weekend_handling,
                    auto_create_recurrences: settings.auto_create_recurrences,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;

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

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Carregando...</div>;
    }

    return (
        <div className="space-y-6 max-w-3xl animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight gradient-text-primary flex items-center gap-2">
                    <SettingsIcon className="h-8 w-8" />
                    Configurações do Sistema
                </h1>
                <p className="text-muted-foreground mt-1">
                    Personalize o comportamento e dados do seu escritório
                </p>
            </div>

            {/* DADOS DO ESCRITÓRIO */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Dados do Escritório
                    </CardTitle>
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
                </CardContent>
            </Card>

            {/* AUTOMAÇÃO E REGRAS */}
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
                            <SelectTrigger id="weekend_handling" className="w-full md:w-[300px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="postpone">Adiar para segunda-feira (Padrão)</SelectItem>
                                <SelectItem value="anticipate">Antecipar para sexta-feira</SelectItem>
                                <SelectItem value="keep">Manter a data original</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border">
                            {settings.default_weekend_handling === "keep" &&
                                "ℹ️ Os prazos permanecerão na data original (Sábado ou Domingo)."}
                            {settings.default_weekend_handling === "anticipate" &&
                                "ℹ️ Se cair no Sábado ou Domingo, o vencimento será na Sexta-feira anterior."}
                            {settings.default_weekend_handling === "postpone" && // next_business_day renomeado para postpone para bater com o backend se necessario, ou manter mapping
                                "ℹ️ Se cair no Sábado ou Domingo, o vencimento será na Segunda-feira seguinte."}
                            {settings.default_weekend_handling === "next_business_day" &&
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

            {/* NOTIFICAÇÕES */}
            <NotificationSettings />

            <div className="flex justify-end pt-4">
                <Button onClick={handleSave} disabled={saving} className="min-w-[150px] gap-2">
                    <Save className="h-4 w-4" />
                    {saving ? "Salvando..." : "Salvar Alterações"}
                </Button>
            </div>
        </div>
    );
}
