
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Plus, Loader2, Check, ChevronsUpDown, Users, User } from "lucide-react";
import { useDeadlines } from "@/hooks/useDeadlines";
import { useClients } from "@/hooks/useClients";
import { useInstallments } from "@/hooks/useInstallments";
import { addMonths, format } from "date-fns";
import { adjustDueDateForWeekend, isWeekend, getWeekendOrHolidayMessage } from "@/lib/weekendUtils";
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
  FormDescription,
} from "@/components/ui/form";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { checkDuplication, DuplicationCheck } from "@/lib/duplicationValidator";
import { DuplicationAlert } from "@/components/shared/DuplicationAlert";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  mode: z.enum(["single", "multi"]).default("single"),
  title: z.string().min(1, "Título é obrigatório"),
  type: z.enum(["obligation", "tax"]),
  description: z.string().optional(),
  client_id: z.string().optional(), // Optional because it depends on mode
  client_ids: z.array(z.string()).optional(), // For multi mode
  due_date: z.date({ required_error: "Data de vencimento é obrigatória" }),
  reference_date: z.string().optional(),
  recurrence: z.enum(["none", "monthly", "quarterly", "semiannual", "annual"]),
  notes: z.string().optional(),
  responsible: z.string().optional(),
  weekend_handling: z.enum(["advance", "postpone", "next_business_day"]),
  has_installments: z.boolean().default(false),
  installment_count: z.string().optional(),
  sphere: z.enum(["federal", "state", "municipal"]).optional(),
}).refine((data) => {
  if (data.mode === "single" && !data.client_id) {
    return false;
  }
  if (data.mode === "multi" && (!data.client_ids || data.client_ids.length === 0)) {
    return false;
  }
  return true;
}, {
  message: "Selecione pelo menos um cliente",
  path: ["client_id"], // This might need adjustment to show error on the right field
});

export function DeadlineForm() {
  const [open, setOpen] = useState(false);
  const { createDeadline, deadlines } = useDeadlines();
  const { clients } = useClients({ pageSize: 1000 }); // Buscar todos os clientes
  const { createInstallment } = useInstallments();
  const [multiSelectOpen, setMultiSelectOpen] = useState(false);
  const { toast } = useToast();
  const [duplicationCheck, setDuplicationCheck] = useState<DuplicationCheck | null>(null);
  const [pendingSubmission, setPendingSubmission] = useState<z.infer<typeof formSchema> | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mode: "single",
      type: "obligation",
      recurrence: "none",
      weekend_handling: "next_business_day",
      has_installments: false,
      installment_count: "1",
      client_ids: [],
      client_id: "",
      sphere: undefined,
    },
  });

  // Check for URL params to pre-fill form (e.g. coming from Templates)
  useEffect(() => {
    const title = searchParams.get("title");
    if (title && !open) {
      const type = searchParams.get("type") as "obligation" | "tax" || "obligation";
      const description = searchParams.get("description") || "";
      const recurrence = searchParams.get("recurrence") as any || "none";
      const sphere = searchParams.get("sphere") as any;
      const day = searchParams.get("day");

      // Set form values
      form.reset({
        mode: "single",
        title,
        type,
        description,
        recurrence,
        sphere,
        weekend_handling: "next_business_day",
        has_installments: false,
        installment_count: "1",
        client_ids: [],
        client_id: "",
        // If day is provided, we can't set due_date directly as Date object without current month/year context
        // But the user will likely pick the date manually anyway.
        // We could try to set a smart default if day exists.
        due_date: new Date(),
      });

      // If we have a day preference, try to set it for current month
      if (day) {
        const today = new Date();
        const targetDate = new Date(today.getFullYear(), today.getMonth(), parseInt(day));
        if (targetDate < today) {
          // If day passed, suggest next month
          targetDate.setMonth(targetDate.getMonth() + 1);
        }
        form.setValue("due_date", targetDate);
      }

      setOpen(true);

      // Clear params to avoid reopening on refresh
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete("title");
        newParams.delete("type");
        newParams.delete("description");
        newParams.delete("recurrence");
        newParams.delete("sphere");
        newParams.delete("day");
        return newParams;
      });
    }
  }, [searchParams, form, open, setSearchParams]);

  const watchedDueDate = form.watch("due_date");
  const watchedWeekendHandling = form.watch("weekend_handling");
  const hasInstallments = form.watch("has_installments");
  const mode = form.watch("mode");
  const selectedClientIds = form.watch("client_ids") || [];

  const dueDateIsWeekend = watchedDueDate && isWeekend(watchedDueDate);
  const adjustedDate =
    watchedDueDate && dueDateIsWeekend
      ? adjustDueDateForWeekend(
        watchedDueDate,
        watchedWeekendHandling
      )
      : null;

  const performSubmission = async (values: z.infer<typeof formSchema>) => {
    const dueDate = values.due_date;
    const originalDueDate = isWeekend(dueDate) ? format(dueDate, "yyyy-MM-dd") : null;
    const adjustedDueDate = isWeekend(dueDate)
      ? format(
        adjustDueDateForWeekend(dueDate, values.weekend_handling),
        "yyyy-MM-dd"
      )
      : format(dueDate, "yyyy-MM-dd");

    const targetClients = values.mode === "single"
      ? [values.client_id!]
      : values.client_ids!;

    try {
      // Create obligations for all selected clients
      await Promise.all(targetClients.map(async (clientId) => {
        const deadline = await createDeadline.mutateAsync({
          title: values.title,
          type: values.type,
          description: values.description,
          client_id: clientId,
          due_date: adjustedDueDate,
          reference_date: values.reference_date ? `${values.reference_date}-01` : null,
          original_due_date: originalDueDate,
          status: "pending",
          recurrence: values.recurrence,
          notes: values.notes,
          responsible: values.responsible,
          weekend_handling: values.weekend_handling,
          sphere: values.sphere,
        });

        if (
          values.has_installments &&
          values.installment_count &&
          parseInt(values.installment_count) > 1
        ) {
          const totalInstallments = parseInt(values.installment_count);
          for (let i = 1; i <= totalInstallments; i++) {
            // Calcular data base da parcela (adicionar meses à data original)
            const baseInstallmentDate = addMonths(dueDate, i - 1);

            // Aplicar regras de final de semana para esta parcela específica
            const adjustedInstallmentDate = isWeekend(baseInstallmentDate)
              ? adjustDueDateForWeekend(baseInstallmentDate, values.weekend_handling)
              : baseInstallmentDate;

            // Salvar data original se foi ajustada
            const originalInstallmentDate = isWeekend(baseInstallmentDate)
              ? format(baseInstallmentDate, "yyyy-MM-dd")
              : null;

            await createInstallment.mutateAsync({
              obligation_id: deadline.id,
              client_id: clientId,
              installment_number: i,
              total_installments: totalInstallments,
              due_date: format(adjustedInstallmentDate, "yyyy-MM-dd"),
              original_due_date: originalInstallmentDate,
              status: "pending",
              amount: 0,
            });
          }
        }
      }));

      const clientCount = targetClients.length;
      toast({
        title: "Sucesso!",
        description: `${clientCount} ${clientCount === 1 ? 'prazo criado' : 'prazos criados'} com sucesso.`,
      });
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error creating deadlines:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o prazo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Validate for duplicates (check first client in multi-mode)
    const clientToCheck = values.mode === "single"
      ? values.client_id!
      : values.client_ids![0];

    const check = checkDuplication(
      {
        client_id: clientToCheck,
        title: values.title,
        due_date: values.due_date,
        type: values.type,
        recurrence: values.recurrence,
      },
      deadlines
    );

    // If exact duplicate, show alert and block
    if (check.level === 'exact') {
      setDuplicationCheck(check);
      return;
    }

    // If probable duplicate or recurrence conflict, ask for confirmation
    if (check.level === 'probable' || check.level === 'recurrence') {
      setDuplicationCheck(check);
      setPendingSubmission(values);
      return;
    }

    // No duplicates, proceed normally
    await performSubmission(values);
  };

  const handleDuplicationConfirm = async () => {
    if (pendingSubmission) {
      await performSubmission(pendingSubmission);
      setPendingSubmission(null);
    }
    setDuplicationCheck(null);
  };

  const handleDuplicationCancel = () => {
    setDuplicationCheck(null);
    setPendingSubmission(null);
  };

  const toggleClientSelection = (clientId: string) => {
    const current = form.getValues("client_ids") || [];
    const updated = current.includes(clientId)
      ? current.filter((id) => id !== clientId)
      : [...current, clientId];
    form.setValue("client_ids", updated);
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
          <DialogDescription>
            Preencha os dados para criar um novo prazo fiscal
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            {/* Mode Selection */}
            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Tabs
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="single" className="gap-2">
                          <User className="h-4 w-4" /> Individual
                        </TabsTrigger>
                        <TabsTrigger value="multi" className="gap-2">
                          <Users className="h-4 w-4" /> Em Massa (Vários Clientes)
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      value={field.value || ""}
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
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mode === "single" ? (
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
            ) : (
              <FormField
                control={form.control}
                name="client_ids"
                render={() => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Clientes Selecionados ({selectedClientIds.length}) *</FormLabel>
                    <Popover open={multiSelectOpen} onOpenChange={setMultiSelectOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              selectedClientIds.length === 0 && "text-muted-foreground"
                            )}
                          >
                            {selectedClientIds.length > 0
                              ? `${selectedClientIds.length} clientes selecionados`
                              : "Selecione os clientes"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0" style={{ pointerEvents: 'auto' }}>
                        <Command style={{ pointerEvents: 'auto' }}>
                          <CommandInput placeholder="Buscar cliente..." style={{ pointerEvents: 'auto' }} />
                          <CommandList style={{ pointerEvents: 'auto', overflowY: 'auto' }}>
                            <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                            <CommandGroup className="max-h-[200px] overflow-auto" style={{ pointerEvents: 'auto' }}>
                              {clients.map((client) => (
                                <CommandItem
                                  key={client.id}
                                  value={client.name}
                                  onSelect={() => toggleClientSelection(client.id)}
                                  style={{ pointerEvents: 'auto' }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedClientIds.includes(client.id)
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {client.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      A obrigação será criada para todos os clientes selecionados.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  {getWeekendOrHolidayMessage(watchedDueDate)}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

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
                {mode === "multi" && selectedClientIds.length > 0
                  ? `Criar para ${selectedClientIds.length} Clientes`
                  : "Criar Prazo"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>

      {duplicationCheck && (
        <DuplicationAlert
          check={duplicationCheck}
          open={!!duplicationCheck}
          onConfirm={handleDuplicationConfirm}
          onCancel={handleDuplicationCancel}
        />
      )}
    </Dialog>
  );
}
