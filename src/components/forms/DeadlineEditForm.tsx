
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle } from "lucide-react";
import { useDeadlines, Deadline } from "@/hooks/useDeadlines";
import { useClients } from "@/hooks/useClients";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { adjustDueDateForWeekend, isWeekend } from "@/lib/weekendUtils";
import { format, parseISO } from "date-fns";

const formSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  type: z.enum(["obligation", "tax"]),
  description: z.string().optional(),
  client_id: z.string().min(1, "Cliente é obrigatório"),
  due_date: z.string().min(1, "Data de vencimento é obrigatória"),
  status: z.enum(["pending", "in_progress", "completed", "overdue"]),
  recurrence: z.enum(["none", "monthly", "quarterly", "semiannual", "annual"]),
  sphere: z.enum(["federal", "state", "municipal"]).optional(),
  reference_date: z.string().optional(),
});

interface DeadlineEditFormProps {
  deadline: Deadline & {
    clients?: { id: string; name: string } | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeadlineEditForm({
  deadline,
  open,
  onOpenChange,
}: DeadlineEditFormProps) {
  const { updateDeadline, deleteDeadline } = useDeadlines();
  const { clients } = useClients({ pageSize: 1000 });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: deadline.title,
      type: deadline.type,
      description: deadline.description || "",
      client_id: deadline.client_id,
      due_date: deadline.due_date,
      status: deadline.status,
      recurrence: deadline.recurrence,
      notes: deadline.notes || "",
      responsible: deadline.responsible || "",
      weekend_handling: (deadline.weekend_handling as "advance" | "postpone" | "next_business_day") || "next_business_day",
      sphere: deadline.sphere as "federal" | "state" | "municipal" | undefined,
      reference_date: deadline.reference_date ? deadline.reference_date.slice(0, 7) : "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: deadline.title,
        type: deadline.type,
        description: deadline.description || "",
        client_id: deadline.client_id,
        due_date: deadline.due_date,
        status: deadline.status,
        recurrence: deadline.recurrence,
        notes: deadline.notes || "",
        responsible: deadline.responsible || "",
        weekend_handling: (deadline.weekend_handling as "advance" | "postpone" | "next_business_day") || "next_business_day",
        sphere: deadline.sphere as "federal" | "state" | "municipal" | undefined,
        reference_date: deadline.reference_date ? deadline.reference_date.slice(0, 7) : "",
      });
    }
  }, [open, deadline, form]);

  const watchedDueDate = form.watch("due_date");
  const watchedWeekendHandling = form.watch("weekend_handling");

  const dueDateIsWeekend = watchedDueDate && isWeekend(parseISO(watchedDueDate));
  const adjustedDate =
    watchedDueDate && dueDateIsWeekend
      ? adjustDueDateForWeekend(
        parseISO(watchedDueDate),
        watchedWeekendHandling
      )
      : null;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const dueDate = parseISO(values.due_date);
    const originalDueDate = isWeekend(dueDate) ? values.due_date : null;
    const adjustedDueDate = isWeekend(dueDate)
      ? format(
        adjustDueDateForWeekend(dueDate, values.weekend_handling),
        "yyyy-MM-dd"
      )
      : values.due_date;

    await updateDeadline.mutateAsync({
      id: deadline.id,
      ...values,
      due_date: adjustedDueDate,
      original_due_date: originalDueDate,
      reference_date: values.reference_date ? `${values.reference_date}-01` : null,
      completed_at:
        values.status === "completed" ? new Date().toISOString() : undefined,
    });

    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (
      confirm(
        "Tem certeza que deseja excluir este prazo? Esta ação não pode ser desfeita."
      )
    ) {
      await deleteDeadline.mutateAsync(deadline.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Prazo</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="obligation">Obrigação</SelectItem>
                        <SelectItem value="tax">Imposto</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sphere"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Esfera</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a esfera" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="federal">Federal</SelectItem>
                        <SelectItem value="state">Estadual</SelectItem>
                        <SelectItem value="municipal">Municipal</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Vencimento *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reference_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mês de Referência</FormLabel>
                    <FormControl>
                      <Input type="month" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recurrence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recorrência</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Não se repete</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="quarterly">Trimestral</SelectItem>
                        <SelectItem value="semiannual">Semestral</SelectItem>
                        <SelectItem value="annual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {dueDateIsWeekend && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Esta data cai em um final de semana.
                  {adjustedDate && (
                    <span className="font-semibold">
                      {" "}
                      Será ajustada para {format(adjustedDate, "dd/MM/yyyy")}.
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="in_progress">Em Andamento</SelectItem>
                        <SelectItem value="completed">Concluída</SelectItem>
                        <SelectItem value="overdue">Atrasada</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weekend_handling"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tratamento de Final de Semana</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="advance">
                          Antecipar para sexta-feira
                        </SelectItem>
                        <SelectItem value="postpone">
                          Adiar para segunda-feira
                        </SelectItem>
                        <SelectItem value="next_business_day">
                          Próximo dia útil (padrão)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="responsible"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-between pt-4 border-t">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteDeadline.isPending}
              >
                {deleteDeadline.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Excluir
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateDeadline.isPending}>
                  {updateDeadline.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
