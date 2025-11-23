
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Loader2 } from "lucide-react";
import { useDeadlines } from "@/hooks/useDeadlines";
import { useClients } from "@/hooks/useClients";
import { useInstallments } from "@/hooks/useInstallments";
import { addMonths, format, parseISO } from "date-fns";
import { adjustDueDateForWeekend, isWeekend } from "@/lib/weekendUtils";
import { FiscalIntelligence, RecurrenceType } from "@/lib/fiscalUtils";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  type: z.enum(["obligation", "tax"]),
  description: z.string().optional(),
  client_id: z.string().min(1, "Cliente é obrigatório"),
  due_date: z.date({ required_error: "Data de vencimento é obrigatória" }),
  reference_date: z.string().optional(),
  recurrence: z.enum(["none", "monthly", "quarterly", "semiannual", "annual"]),
  notes: z.string().optional(),
  responsible: z.string().optional(),
  weekend_handling: z.enum(["advance", "postpone", "next_business_day"]),
  has_installments: z.boolean().default(false),
  installment_count: z.string().optional(),
});

export function DeadlineForm() {
  const [open, setOpen] = useState(false);
  const { createDeadline } = useDeadlines();
  const { clients } = useClients();
  const { createInstallment } = useInstallments();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "obligation",
      recurrence: "none",
      weekend_handling: "next_business_day",
      has_installments: false,
      installment_count: "1",
    },
  });

  const watchedDueDate = form.watch("due_date");
  const watchedWeekendHandling = form.watch("weekend_handling");
  const hasInstallments = form.watch("has_installments");

  const dueDateIsWeekend = watchedDueDate && isWeekend(watchedDueDate);
  const adjustedDate =
    watchedDueDate && dueDateIsWeekend
      ? adjustDueDateForWeekend(
        watchedDueDate,
        watchedWeekendHandling
      )
      : null;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const dueDate = values.due_date;
    const originalDueDate = isWeekend(dueDate) ? format(dueDate, "yyyy-MM-dd") : null;
    const adjustedDueDate = isWeekend(dueDate)
      ? format(
        adjustDueDateForWeekend(dueDate, values.weekend_handling),
        "yyyy-MM-dd"
      )
      : format(dueDate, "yyyy-MM-dd");

    const deadline = await createDeadline.mutateAsync({
      title: values.title,
      type: values.type,
      description: values.description,
      client_id: values.client_id,
      due_date: adjustedDueDate,
      reference_date: values.reference_date ? `${values.reference_date}-01` : null,
      original_due_date: originalDueDate,
      status: "pending",
      recurrence: values.recurrence,
      notes: values.notes,
      responsible: values.responsible,
      weekend_handling: values.weekend_handling,
    });

    if (
      values.has_installments &&
      values.installment_count &&
      parseInt(values.installment_count) > 1
    ) {
      const totalInstallments = parseInt(values.installment_count);
      for (let i = 1; i <= totalInstallments; i++) {
        const installmentDueDate = format(
          addMonths(dueDate, i - 1),
          "yyyy-MM-dd"
        );
        await createInstallment.mutateAsync({
          obligation_id: deadline.id,
          client_id: values.client_id || deadline.client_id || undefined,
          installment_number: i,
          total_installments: totalInstallments,
          due_date: installmentDueDate,
          status: "pending",
          amount: 0,
        });
      }
    }

    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Prazo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Prazo Fiscal</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: DCTF - Declaração de Débitos"
                      {...field}
                    />
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
                    <Textarea
                      placeholder="Descrição detalhada do prazo"
                      rows={3}
                      {...field}
                    />
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
                        <SelectValue placeholder="Selecione o cliente" />
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Vencimento *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reference_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mês de Referência (Competência)</FormLabel>
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

            {watchedDueDate && (
              <div className="text-xs text-muted-foreground px-1">
                Competência estimada: <span className="font-medium text-primary">
                  {FiscalIntelligence.formatReferenceDate(
                    watchedDueDate,
                    form.watch("recurrence") as RecurrenceType
                  )}
                </span>
              </div>
            )}

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

            <FormField
              control={form.control}
              name="responsible"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome do responsável pelo prazo"
                      {...field}
                    />
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
                    <Textarea
                      placeholder="Notas adicionais sobre este prazo"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 border-t pt-4">
              <FormField
                control={form.control}
                name="has_installments"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      Dividir em parcelas
                    </FormLabel>
                  </FormItem>
                )}
              />

              {hasInstallments && (
                <FormField
                  control={form.control}
                  name="installment_count"
                  render={({ field }) => (
                    <FormItem className="pl-6">
                      <FormLabel>Número de Parcelas</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="2"
                          max="12"
                          placeholder="Ex: 3"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createDeadline.isPending}
              >
                {createDeadline.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Criar Prazo
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
