import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Installment {
  id: string;
  obligation_id: string;
  installment_number: number;
  total_installments: number;
  amount: number;
  due_date: string;
  paid_at?: string;
  status: "pending" | "paid" | "overdue";
  created_at: string;
  updated_at: string;
}

export function useInstallments(obligationId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: installments = [], isLoading } = useQuery({
    queryKey: ["installments", obligationId],
    queryFn: async () => {
      let query = supabase
        .from("installments")
        .select(`
          *,
          obligations!installments_obligation_id_fkey (
            id,
            title,
            clients (
              id,
              name
            )
          )
        `)
        .order("due_date", { ascending: true });

      if (obligationId) {
        query = query.eq("obligation_id", obligationId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createInstallment = useMutation({
    mutationFn: async (installment: Omit<Installment, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("installments")
        .insert([installment])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["installments"] });
      toast({ title: "Parcela criada com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar parcela",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateInstallment = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Installment> & { id: string }) => {
      const { data, error } = await supabase
        .from("installments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["installments"] });
      toast({ title: "Parcela atualizada com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar parcela",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteInstallment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("installments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["installments"] });
      toast({ title: "Parcela excluída com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir parcela",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    installments,
    isLoading,
    createInstallment,
    updateInstallment,
    deleteInstallment,
  };
}
