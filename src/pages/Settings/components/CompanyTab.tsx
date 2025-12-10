import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SettingsTabProps } from "@/types/settings";

/**
 * Aba de dados da empresa/escritório
 */
export function CompanyTab({ settings, onChange }: SettingsTabProps) {
    return (
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
                            onChange={(e) => onChange({ office_name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="office_document">CNPJ</Label>
                        <Input
                            id="office_document"
                            placeholder="00.000.000/0000-00"
                            value={settings.office_document}
                            onChange={(e) => onChange({ office_document: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="office_address">Endereço</Label>
                    <Input
                        id="office_address"
                        placeholder="Rua, Número, Bairro, Cidade - UF"
                        value={settings.office_address}
                        onChange={(e) => onChange({ office_address: e.target.value })}
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="office_phone">Telefone</Label>
                        <Input
                            id="office_phone"
                            placeholder="(00) 0000-0000"
                            value={settings.office_phone}
                            onChange={(e) => onChange({ office_phone: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="office_email">E-mail</Label>
                        <Input
                            id="office_email"
                            type="email"
                            placeholder="contato@escritorio.com"
                            value={settings.office_email}
                            onChange={(e) => onChange({ office_email: e.target.value })}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
