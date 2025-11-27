import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, BellOff, CheckCircle2 } from "lucide-react";
import { useNotificationPermission } from "@/hooks/useNotificationPermission";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export function NotificationSettings() {
    const { permission, isSupported, requestPermission, sendNotification, isGranted } = useNotificationPermission();
    const { toast } = useToast();
    const [enabled, setEnabled] = useState(isGranted);

    const handleEnableNotifications = async () => {
        const granted = await requestPermission();
        if (granted) {
            setEnabled(true);
            toast({
                title: "Notificações ativadas!",
                description: "Você receberá lembretes sobre prazos próximos.",
            });

            // Enviar notificação de teste
            await sendNotification("Controle Fiscal", {
                body: "Notificações ativadas com sucesso! Você receberá lembretes sobre seus prazos.",
                icon: "/logo.svg",
            });
        } else {
            toast({
                title: "Permissão negada",
                description: "Não foi possível ativar as notificações. Verifique as configurações do navegador.",
                variant: "destructive",
            });
        }
    };

    if (!isSupported) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BellOff className="h-5 w-5" />
                        Notificações não suportadas
                    </CardTitle>
                    <CardDescription>
                        Seu navegador não suporta notificações push. Considere usar Chrome, Firefox ou Edge.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notificações de Vencimentos
                    {isGranted && <Badge variant="outline" className="ml-auto">Ativo</Badge>}
                </CardTitle>
                <CardDescription>
                    Receba alertas sobre prazos próximos diretamente no seu navegador
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="notifications-enabled">Ativar Notificações</Label>
                        <div className="text-sm text-muted-foreground">
                            Status atual: <span className="font-medium">
                                {permission === "granted" ? "Permitido" : permission === "denied" ? "Negado" : "Não configurado"}
                            </span>
                        </div>
                    </div>
                    <Switch
                        id="notifications-enabled"
                        checked={enabled && isGranted}
                        onCheckedChange={(checked) => {
                            if (checked && !isGranted) {
                                handleEnableNotifications();
                            } else {
                                setEnabled(checked);
                            }
                        }}
                        disabled={permission === "denied"}
                    />
                </div>

                {permission === "denied" && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                        <p className="text-sm text-destructive">
                            As notificações foram bloqueadas. Para reativar, acesse as configurações do navegador e permita
                            notificações para este site.
                        </p>
                    </div>
                )}

                {isGranted && (
                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-start gap-3 text-sm">
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                                <p className="font-medium">Notificações configuradas</p>
                                <p className="text-muted-foreground">
                                    Você receberá lembretes automáticos 1, 3 e 7 dias antes dos vencimentos
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            onClick={() => {
                                sendNotification("Teste de Notificação", {
                                    body: "Esta é uma notificação de teste. Funciona perfeitamente!",
                                    icon: "/logo.svg",
                                });
                            }}
                        >
                            Enviar Notificação de Teste
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
