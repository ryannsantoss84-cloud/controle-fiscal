import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Calendar, Receipt, Pencil, Trash2, Loader2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTemplates, type Template } from "@/hooks/useTemplates";
import { TemplateForm } from "@/components/templates/TemplateForm";
import { TemplateDetailsDialog } from "@/components/templates/TemplateDetailsDialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Templates() {
    const navigate = useNavigate();
    const { templates, isLoading, deleteTemplate } = useTemplates();
    const [editingTemplate, setEditingTemplate] = useState<Template | undefined>(undefined);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [viewingTemplate, setViewingTemplate] = useState<Template | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const handleUseTemplate = (template: Template) => {
        // Navegar para criação de prazo com dados pré-preenchidos
        const params = new URLSearchParams({
            title: template.name,
            description: template.description || "",
            type: template.type,
            recurrence: template.recurrence,
            day: template.day_of_month?.toString() || "",
            sphere: template.items?.[0]?.sphere || "",
        });
        navigate(`/deadlines?${params.toString()}`);
    };

    const handleEdit = (template: Template) => {
        setEditingTemplate(template);
        setIsFormOpen(true);
    };

    const handleDelete = async () => {
        if (deletingId) {
            await deleteTemplate.mutateAsync(deletingId);
            setDeletingId(null);
        }
    };

    const handleFormOpenChange = (open: boolean) => {
        setIsFormOpen(open);
        if (!open) {
            setEditingTemplate(undefined);
        }
    };

    const recurrenceLabels: Record<string, string> = {
        none: "Única",
        monthly: "Mensal",
        quarterly: "Trimestral",
        semiannual: "Semestral",
        annual: "Anual",
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight gradient-text-primary flex items-center gap-2">
                        <FileText className="h-8 w-8" />
                        Templates de Prazos
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie seus modelos para criar prazos fiscais rapidamente
                    </p>
                </div>
                <TemplateForm
                    open={isFormOpen}
                    onOpenChange={handleFormOpenChange}
                    template={editingTemplate}
                />
            </div>

            {/* Templates Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                    <Card key={template.id} className="hover:shadow-md transition-shadow group relative">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    {template.type === "obligation" ? (
                                        <Calendar className="h-5 w-5 text-primary" />
                                    ) : (
                                        <Receipt className="h-5 w-5 text-chart-2" />
                                    )}
                                    <CardTitle className="text-base line-clamp-1" title={template.name}>
                                        {template.name}
                                    </CardTitle>
                                </div>
                                <Badge variant={template.type === "tax" ? "destructive" : "outline"} className="text-xs shrink-0">
                                    {template.type === "tax" ? "Imposto" : "Obrigação"}
                                </Badge>
                            </div>
                            <CardDescription className="text-sm mt-2 line-clamp-2 h-10">
                                {template.description || "Sem descrição"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Recorrência:</span>
                                <Badge variant="secondary">{recurrenceLabels[template.recurrence] || template.recurrence}</Badge>
                            </div>
                            {template.day_of_month && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Vencimento:</span>
                                    <span className="font-medium">Dia {template.day_of_month}</span>
                                </div>
                            )}

                            <div className="pt-2 flex gap-2">
                                <Button
                                    className="flex-1 gap-2"
                                    onClick={() => handleUseTemplate(template)}
                                >
                                    <Plus className="h-4 w-4" />
                                    Usar
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                        setViewingTemplate(template);
                                        setIsDetailsOpen(true);
                                    }}
                                    title="Ver Detalhes"
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleEdit(template)}
                                    title="Editar"
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => setDeletingId(template.id)}
                                    title="Excluir"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {templates.length === 0 && (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium">Nenhum template encontrado</h3>
                    <p className="mb-4">Crie seu primeiro template para agilizar o cadastro de prazos.</p>
                    <Button onClick={() => setIsFormOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Template
                    </Button>
                </div>
            )}

            <TemplateDetailsDialog
                template={viewingTemplate}
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
            />

            <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Template</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir este template? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
