import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppearanceTabProps } from "@/types/settings";

/**
 * Aba de preferências visuais
 */
export function AppearanceTab({ settings, onChange, theme, setTheme }: AppearanceTabProps) {
    return (
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
                        onValueChange={(value) => onChange({ items_per_page: parseInt(value) })}
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
    );
}
