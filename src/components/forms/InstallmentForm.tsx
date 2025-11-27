import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { addMonths, parseISO, format } from "date-fns";
import { isWeekend, adjustDueDateForWeekend } from "@/lib/weekendUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Plus, Loader2 } from "lucide-react";
import { useInstallments } from "@/hooks/useInstallments";
import { useClients } from "@/hooks/useClients";
import { checkInstallmentDuplication, InstallmentDuplicationCheck } from "@/lib/installmentDuplicationValidator";
import { DuplicationAlert } from "@/components/shared/DuplicationAlert";
import { useToast } from "@/hooks/use-toast";
import { ConfirmLargeInstallmentDialog } from "@/components/shared/ConfirmLargeInstallmentDialog";
import { ProgressDialog } from "@/components/shared/ProgressDialog";

const formSchema = z.object({
  name: z.string().min(1, "Nome/Título é obrigatório"),
  client_id: z.string().min(1, "Cliente é obrigatório"),
  protocol: z.string().optional(),
  due_date: z.string().min(1, "Data de vencimento é obrigatória"),
  status: z.enum(["pending", "paid", "overdue"]),
  installment_number: z.coerce.number()
    .min(1, "Número da parcela deve ser no mínimo 1")
    .max(200, "Número da parcela não pode exceder 200"),
  total_installments: z.coerce.number()
    .min(1, "Total de parcelas deve ser no mínimo 1")
    .max(200, "Máximo de 200 parcelas permitido"),
  weekend_rule: z.enum(["postpone", "anticipate", "keep"]).default("postpone"),
  sphere: z.enum(["federal", "state", "municipal"]).optional(),
}).refine((data) => data.installment_number <= data.total_installments, {
  message: "Número da parcela não pode ser maior que o total",
  path: ["installment_number"],
});

interface InstallmentFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function InstallmentForm({ open: controlledOpen, onOpenChange: controlledOnOpenChange }: InstallmentFormProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const { createInstallment, installments } = useInstallments();
  const { clients } = useClients({ pageSize: 1000 });
  const { toast } = useToast();
  const [duplicationCheck, setDuplicationCheck] = useState<InstallmentDuplicationCheck | null>(null);
  const [pendingSubmission, setPendingSubmission] = useState<z.infer<typeof formSchema> | null>(null);

  // Batch processing states
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalToCreate, setTotalToCreate] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingValues, setPendingValues] = useState<z.infer<typeof formSchema> | null>(null);

  const BATCH_SIZE = 10; // Criar 10 parcelas por vez
  const LARGE_BATCH_THRESHOLD = 50; // Confirmar se > 50

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      protocol: "",
      status: "pending",
      installment_number: 1,
      total_installments: 1,
      weekend_rule: "postpone",
      sphere: undefined,
    },
  });

  // Converter regra de weekend para formato esperado
  const convertWeekendRule = (rule: "postpone" | "anticipate" | "keep"): "advance" | "postpone" | "next_business_day" => {
    if (rule === "postpone") return "next_business_day";
    if (rule === "anticipate") return "advance";
    return "next_business_day";
  };

  const performSubmission = async (values: z.infer<typeof formSchema>, skipConfirm = false) => {
    const remainingCount = values.total_installments - values.installment_number;
    const totalToCreate = remainingCount + 1; // +1 para a parcela principal

    // Se for grande volume e não pulou confirmação, pedir confirmação
    if (remainingCount > LARGE_BATCH_THRESHOLD && !skipConfirm) {
      setPendingValues(values);
      setTotalToCreate(totalToCreate);
      setShowConfirm(true);
      return;
    }

    setIsCreating(true);
    setProgress(0);
    setTotalToCreate(totalToCreate);

    try {
      // Criar a parcela principal
      await createInstallment.mutateAsync({
        name: values.name,
        client_id: values.client_id,
        amount: 0,
        due_date: values.due_date,
        status: values.status,
        installment_number: values.installment_number,
        total_installments: values.total_installments,
        obligation_id: null,
        // @ts-ignore
        protocol: values.protocol,
        // @ts-ignore
        sphere: values.sphere,
      });

      setProgress(1);

      // Gerar parcelas restantes em lotes
      if (remainingCount > 0) {
        const batches = Math.ceil(remainingCount / BATCH_SIZE);

        for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
          const batchStart = batchIndex * BATCH_SIZE + 1;
          const batchEnd = Math.min((batchIndex + 1) * BATCH_SIZE, remainingCount);

          // Criar parcelas do lote atual em paralelo
          const batchPromises = [];
          for (let i = batchStart; i <= batchEnd; i++) {
            const nextNumber = values.installment_number + i;
            const baseDate = addMonths(parseISO(values.due_date), i);
            const adjustedDate = isWeekend(baseDate)
              ? adjustDueDateForWeekend(baseDate, convertWeekendRule(values.weekend_rule))
              : baseDate;
            const originalDate = isWeekend(baseDate) ? format(baseDate, "yyyy-MM-dd") : null;

            batchPromises.push(
              createInstallment.mutateAsync({
                name: values.name,
                client_id: values.client_id,
                amount: 0,
                due_date: format(adjustedDate, "yyyy-MM-dd"),
                original_due_date: originalDate,
                status: "pending",
                installment_number: nextNumber,
                total_installments: values.total_installments,
                obligation_id: null,
                // @ts-ignore
                protocol: values.protocol,
                // @ts-ignore
                sphere: values.sphere,
              })
            );
          }

          // Aguardar lote completar
          await Promise.all(batchPromises);

          // Atualizar progresso
          setProgress(batchEnd + 1);

          // Pequeno delay entre lotes para não sobrecarregar
          if (batchIndex < batches - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }

      toast({
        title: "Sucesso!",
        description: remainingCount > 0
          ? `${totalToCreate} parcelas criadas com sucesso!`
          : "Parcela criada com sucesso.",
      });

      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Erro ao criar parcelas:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar parcelas. Algumas podem ter sido criadas.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
      setProgress(0);
      setTotalToCreate(0);
      setShowConfirm(false);
      setPendingValues(null);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Validar duplicatas
    const check = checkInstallmentDuplication(
      {
        client_id: values.client_id,
        installment_number: values.installment_number,
        due_date: values.due_date,
        protocol: values.protocol,
      },
      installments
    );

    // Se for duplicata exata, bloquear
    if (check.level === 'exact') {
      setDuplicationCheck(check);
      return;
    }

    // Se for protocolo duplicado, alertar
    if (check.level === 'protocol') {
      setDuplicationCheck(check);
      setPendingSubmission(values);
      return;
    }

    // Sem duplicatas, criar normalmente
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

  const handleConfirmLargeBatch = async () => {
    if (pendingValues) {
      await performSubmission(pendingValues, true);
    }
  };

  const handleCancelLargeBatch = () => {
    setShowConfirm(false);
    setPendingValues(null);
    setTotalToCreate(0);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!controlledOnOpenChange && (
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Parcela Avulsa
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Parcela Avulsa</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título / Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Taxa Extra" {...field} />
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
                  <FormLabel>Cliente</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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

            <FormField
              control={form.control}
              name="sphere"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Esfera</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="protocol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Protocolo (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vencimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="installment_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nº da Parcela</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
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
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Inicial</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="paid">Pago</SelectItem>
                        <SelectItem value="overdue">Atrasado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weekend_rule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fim de Semana</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createInstallment.isPending}>
                {createInstallment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Parcela
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>

      {duplicationCheck && (
        <DuplicationAlert
          check={duplicationCheck as any}
          open={!!duplicationCheck}
          onConfirm={handleDuplicationConfirm}
          onCancel={handleDuplicationCancel}
        />
      )}

      <ConfirmLargeInstallmentDialog
        open={showConfirm}
        count={totalToCreate}
        onConfirm={handleConfirmLargeBatch}
        onCancel={handleCancelLargeBatch}
      />

      <ProgressDialog
        open={isCreating}
        progress={progress}
        total={totalToCreate}
      />
    </Dialog>
  );
}
