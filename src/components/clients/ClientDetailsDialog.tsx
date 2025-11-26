import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Client } from "@/hooks/useClients";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Building2, Mail, Phone, FileText, Calendar } from "lucide-react";
import { ClientReportButton } from "./ClientReportButton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ClientDetailsDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const taxRegimeLabels: Record<string, string> = {
  simples_nacional: "Simples Nacional",
  lucro_presumido: "Lucro Presumido",
  lucro_real: "Lucro Real",
};

export function ClientDetailsDialog({
  client,
  open,
  onOpenChange,
}: ClientDetailsDialogProps) {
  // Fetch obligations for the report
  const { data: obligations = [] } = useQuery({
    queryKey: ["client-obligations", client?.id],
    queryFn: async () => {
      if (!client?.id) return [];
      const { data, error } = await supabase
        .from("obligations")
        .select("*")
        .eq("client_id", client.id)
        .order("due_date", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!client?.id && open,
  });

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Detalhes do Cliente</DialogTitle>
          <ClientReportButton client={client} obligations={obligations} />
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{client.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">CNPJ</p>
                <p className="font-medium">{client.cnpj}</p>
              </div>
            </div>

            {client.tax_regime && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Regime Tributário</p>
                  <p className="font-medium">{taxRegimeLabels[client.tax_regime] || client.tax_regime}</p>
                </div>
              </div>
            )}

            {client.email && (
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{client.email}</p>
                </div>
              </div>
            )}

            {client.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{client.phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Cliente desde</p>
                <p className="font-medium">
                  {format(new Date(client.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
