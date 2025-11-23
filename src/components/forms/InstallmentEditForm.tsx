import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClients } from "@/hooks/useClients";
import { format, isWeekend } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar as CalendarIcon, AlertTriangle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  client_id: z.string().min(1, "Cliente é obrigatório"),
  installment_number: z.number().min(1, "Número da parcela deve ser maior que 0"),
  total_installments: z.number().min(1, "Total de parcelas deve ser maior que 0"),
  due_date: z.date(),
  weekend_handling: z.enum(["advance", "postpone", "next_business_day"]),
  notes: z.string().optional(),
});

interface InstallmentEditFormProps {
  installment: any;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  onUpdate?: (id: string, data: any) => void;
}

export function InstallmentEditForm({ installment, open, onOpenChange, onSuccess, onUpdate }: InstallmentEditFormProps) {
  const { clients } = useClients();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_id: installment.client_id || installment.obligation_id || "",
      installment_number: installment.installment_number || 1,
      total_installments: installment.total_installments || 1,
      due_date: new Date(installment.due_date),
      weekend_handling: installment.weekend_handling || "next_business_day",
      notes: installment.notes || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        client_id: installment.client_id || installment.obligation_id || "",
        installment_number: installment.installment_number || 1,
        total_installments: installment.total_installments || 1,
        due_date: new Date(installment.due_date),
        weekend_handling: installment.weekend_handling || "next_business_day",
        notes: installment.notes || "",
      });
    }
  }, [installment, open, form]);

  const selectedDate = form.watch("due_date");
  const weekendHandling = form.watch("weekend_handling");
  const showWeekendWarning = selectedDate && isWeekend(selectedDate);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    let finalDueDate = values.due_date;

    if (isWeekend(finalDueDate)) {
      const dayOfWeek = finalDueDate.getDay();
      const newDate = new Date(finalDueDate);

      if (values.weekend_handling === "advance") {
        if (dayOfWeek === 0) newDate.setDate(newDate.getDate() - 2);
        if (dayOfWeek === 6) newDate.setDate(newDate.getDate() - 1);
      } else if (values.weekend_handling === "postpone") {
        if (dayOfWeek === 0) newDate.setDate(newDate.getDate() + 1);
        if (dayOfWeek === 6) newDate.setDate(newDate.getDate() + 2);
      } else {
        if (dayOfWeek === 0) newDate.setDate(newDate.getDate() + 1);
        if (dayOfWeek === 6) newDate.setDate(newDate.getDate() + 2);
      }

      finalDueDate = newDate;
    }

    await onUpdate(installment.id, {
      ...values,
      due_date: format(finalDueDate, "yyyy-MM-dd"),
      original_due_date: isWeekend(values.due_date)
        ? format(values.due_date, "yyyy-MM-dd")
        : null,
    });

    onSuccess?.();
  };

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
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
            name="installment_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número da Parcela</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="total_installments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total de Parcelas</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="due_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data de Vencimento</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? format(field.value, "dd/MM/yyyy") : "Selecione uma data"}
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
          name="weekend_handling"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tratamento de Final de Semana</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="advance">Adiantar para sexta-feira</SelectItem>
                  <SelectItem value="postpone">Postergar para segunda-feira</SelectItem>
                  <SelectItem value="next_business_day">Próximo dia útil</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {showWeekendWarning && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              A data selecionada cai em um final de semana.
              {weekendHandling === "advance" && " Será ajustada para a sexta-feira anterior."}
              {weekendHandling === "postpone" && " Será ajustada para a segunda-feira seguinte."}
              {weekendHandling === "next_business_day" && " Será ajustada para o próximo dia útil."}
            </AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea placeholder="Observações adicionais..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Salvar Alterações
        </Button>
      </form>
    </Form>
  );

  if (open !== undefined && onOpenChange) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Parcela</DialogTitle>
            <DialogDescription>
              Faça alterações na parcela abaixo
            </DialogDescription>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return formContent;
}
