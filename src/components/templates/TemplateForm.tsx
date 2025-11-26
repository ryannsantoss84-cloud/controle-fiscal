import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, GripVertical, Calendar } from "lucide-react";
import { useTemplates, type Template } from "@/hooks/useTemplates";

// --- Schema ---
const itemSchema = z.object({
    title: z.string().min(1, "Nome da obrigação é obrigatório"),
    description: z.string().optional(),
    type: z.enum(["obligation", "tax"], {
        required_error: "Selecione o tipo",
    }),
    recurrence: z.enum(["none", "monthly", "quarterly", "semiannual", "annual"], {
        required_error: "Selecione a recorrência",
    }),
    day_of_month: z.coerce.number().min(1).max(31).optional(),
    weekend_rule: z.enum(["postpone", "anticipate", "keep"]).optional().default("postpone"),
    sphere: z.enum(["federal", "state", "municipal"]).optional(),
});

const formSchema = z.object({
    name: z.string().min(1, "Nome do template é obrigatório"),
    description: z.string().optional(),
    tax_regimes: z.array(z.string()).optional(),
    business_activities: z.array(z.string()).optional(),
    items: z.array(itemSchema).min(1, "Adicione pelo menos uma obrigação"),
});

// --- Componente Sortable Item ---
function SortableItem({ id, index, remove, form }: { id: string; index: number; remove: (index: number) => void; form: any }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="mb-4">
            <Card className="bg-muted/20 border-l-4 border-l-primary/20">
                <CardContent className="pt-6">
                    <div className="flex justify-between mb-4 items-center">
                        <div className="flex items-center gap-2">
                            <div
                                {...attributes}
                                {...listeners}
                                className="cursor-grab hover:bg-muted p-1 rounded transition-colors"
                            >
                                <GripVertical className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <h4 className="text-sm font-medium text-muted-foreground">Item {index + 1}</h4>
                        </div>
                        {form.getValues("items").length > 1 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => remove(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-8">
                        <FormField
                            control={form.control}
                            name={`items.${index}.title`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome da Obrigação</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: DAS" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-2">
                            <FormField
                                control={form.control}
                                name={`items.${index}.type`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="obligation">Obrigação</SelectItem>
                                                <SelectItem value="tax">Imposto</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name={`items.${index}.sphere`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Esfera</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="federal">Federal</SelectItem>
                                                <SelectItem value="state">Estadual</SelectItem>
                                                <SelectItem value="municipal">Municipal</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name={`items.${index}.recurrence`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Recorrência</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">Nenhuma</SelectItem>
                                                <SelectItem value="monthly">Mensal</SelectItem>
                                                <SelectItem value="quarterly">Trimestral</SelectItem>
                                                <SelectItem value="semiannual">Semestral</SelectItem>
                                                <SelectItem value="annual">Anual</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <FormField
                                control={form.control}
                                name={`items.${index}.day_of_month`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Dia Vencimento</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="31"
                                                placeholder="Ex: 20"
                                                {...field}
                                                value={field.value?.toString() || ""}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name={`items.${index}.weekend_rule`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fim de Semana</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || "postpone"}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="postpone">Postergar (Seg)</SelectItem>
                                                <SelectItem value="anticipate">Antecipar (Sex)</SelectItem>
                                                <SelectItem value="keep">Manter</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Preview de Inteligência Fiscal */}
                        {(form.watch(`items.${index}.recurrence`) === "quarterly" || form.watch(`items.${index}.recurrence`) === "annual") && (
                            <div className="col-span-1 md:col-span-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {form.watch(`items.${index}.recurrence`) === "quarterly"
                                        ? "Será gerado em: Jan, Abr, Jul, Out"
                                        : "Será gerado anualmente (padrão: Janeiro)"}
                                </span>
                            </div>
                        )}

                        <FormField
                            control={form.control}
                            name={`items.${index}.description`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Detalhes..." {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// --- Componente Principal ---
interface TemplateFormProps {
    template?: Template;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function TemplateForm({ template, open: controlledOpen, onOpenChange: controlledOnOpenChange }: TemplateFormProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const { createTemplate, updateTemplate } = useTemplates();

    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = controlledOnOpenChange || setInternalOpen;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            tax_regimes: [],
            business_activities: [],
            items: [{ title: "", type: "obligation", recurrence: "monthly", weekend_rule: "postpone", sphere: "federal" }],
        },
    });

    const { fields, append, remove, move } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (template) {
            const items = template.items && template.items.length > 0
                ? template.items
                : [{
                    title: template.name,
                    description: template.description,
                    type: template.type || "obligation",
                    recurrence: template.recurrence || "monthly",
                    day_of_month: template.day_of_month,
                    weekend_rule: "postpone"
                }];

            form.reset({
                name: template.name,
                description: template.description || "",
                tax_regimes: template.tax_regimes || [],
                business_activities: template.business_activities || [],
                items: items.map(i => ({ ...i, weekend_rule: i.weekend_rule || "postpone" })) as any,
            });
        } else {
            form.reset({
                name: "",
                description: "",
                tax_regimes: [],
                business_activities: [],
                items: [{ title: "", type: "obligation", recurrence: "monthly", weekend_rule: "postpone", sphere: "federal" }],
            });
        }
    }, [template, form]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = fields.findIndex((field) => field.id === active.id);
            const newIndex = fields.findIndex((field) => field.id === over.id);
            move(oldIndex, newIndex);
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const firstItem = values.items[0];
        const payload = {
            ...values,
            type: firstItem.type,
            recurrence: firstItem.recurrence,
            day_of_month: firstItem.day_of_month,
        };

        if (template) {
            await updateTemplate.mutateAsync({
                id: template.id,
                ...payload,
            } as any);
        } else {
            await createTemplate.mutateAsync(payload as any);
        }
        setOpen(false);
        form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!template && (
                <DialogTrigger asChild>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Novo Template
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{template ? "Editar Template" : "Novo Template"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome do Pacote *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Obrigações Simples Nacional" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descrição</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Descrição opcional..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border p-4 rounded-md">
                            <FormField
                                control={form.control}
                                name="tax_regimes"
                                render={() => (
                                    <FormItem>
                                        <FormLabel className="text-base font-semibold">Regimes Tributários</FormLabel>
                                        <div className="grid grid-cols-1 gap-2 mt-2">
                                            {[
                                                { id: "simples_nacional", label: "Simples Nacional" },
                                                { id: "lucro_presumido", label: "Lucro Presumido" },
                                                { id: "lucro_real", label: "Lucro Real" },
                                            ].map((item) => (
                                                <FormField
                                                    key={item.id}
                                                    control={form.control}
                                                    name="tax_regimes"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.includes(item.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        return checked
                                                                            ? field.onChange([...(field.value || []), item.id])
                                                                            : field.onChange(field.value?.filter((value) => value !== item.id))
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="font-normal cursor-pointer">{item.label}</FormLabel>
                                                        </FormItem>
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="business_activities"
                                render={() => (
                                    <FormItem>
                                        <FormLabel className="text-base font-semibold">Atividades</FormLabel>
                                        <div className="grid grid-cols-1 gap-2 mt-2">
                                            {[
                                                { id: "commerce", label: "Comércio" },
                                                { id: "service", label: "Serviço" },
                                                { id: "both", label: "Ambos (Geral)" },
                                            ].map((item) => (
                                                <FormField
                                                    key={item.id}
                                                    control={form.control}
                                                    name="business_activities"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.includes(item.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        return checked
                                                                            ? field.onChange([...(field.value || []), item.id])
                                                                            : field.onChange(field.value?.filter((value) => value !== item.id))
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="font-normal cursor-pointer">{item.label}</FormLabel>
                                                        </FormItem>
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Obrigações do Pacote</h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => append({ title: "", type: "obligation", recurrence: "monthly", weekend_rule: "postpone", sphere: "federal" })}
                                >
                                    <Plus className="h-4 w-4 mr-2" /> Adicionar Obrigação
                                </Button>
                            </div>

                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={fields.map((f) => f.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {fields.map((field, index) => (
                                        <SortableItem
                                            key={field.id}
                                            id={field.id}
                                            index={index}
                                            remove={remove}
                                            form={form}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        </div>

                        <div className="flex gap-2 justify-end pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setOpen(false);
                                    form.reset();
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit">
                                {template ? "Atualizar" : "Criar"} Template
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
