import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SettingsTabProps } from "@/types/settings";

/**
 * Aba de regras de automação
 */
export function AutomationTab({ settings, onChange }: SettingsTabProps) {
    return (
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
                        onValueChange={(value) => onChange({ default_weekend_handling: value as any })}
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
                        onCheckedChange={(checked) => onChange({ auto_create_recurrences: checked })}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
