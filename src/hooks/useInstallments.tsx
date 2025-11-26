import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export interface Installment {
  id: string;
  obligation_id?: string | null;
  client_id?: string;
  installment_number: number;
  total_installments: number;
  amount: number;
  due_date: string;
  paid_at?: string;
  status: "pending" | "paid" | "overdue";
  created_at: string;
  updated_at: string;
  name?: string; // Adicionado para parcelas avulsas
}

interface UseInstallmentsOptions {
  page?: number;
  pageSize?: number;
  obligationId?: string;
}

export function useInstallments(options: UseInstallmentsOptions | string = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Handle both object options and legacy string obligationId
  const { page = 1, pageSize = 50, obligationId } = typeof options === 'string'
    ? { obligationId: options, page: 1, pageSize: 50 }
    : options;

  const { data: installments = [], isLoading } = useQuery({
    queryKey: ["installments", obligationId, page, pageSize],
    queryFn: async () => {
      let query = supabase
        .from("installments")
        .select(`
          *,
          clients (
            id,
            name
          ),
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

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error } = await query.range(from, to);
      if (error) throw error;
      return data;
    },
    placeholderData: (previousData) => previousData, // Mantém dados antigos enquanto carrega novos (UX melhor)
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('public:installments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'installments' },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["installments"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const createInstallment = useMutation({
    mutationFn: async (installment: Omit<Installment, "id" | "created_at" | "updated_at">) => {
      // Sanitização: Garantir que client_id não seja uma string vazia
      const sanitizedInstallment = {
        ...installment,
        client_id: installment.client_id || null,
        obligation_id: installment.obligation_id || null, // Agora pode ser nulo
        amount: Number(installment.amount) || 0,
      };

      // Removida a verificação estrita de obligation_id

      console.log("Creating installment with payload:", sanitizedInstallment);
      console.log("Payload types:", {
        client_id: typeof sanitizedInstallment.client_id,
        obligation_id: typeof sanitizedInstallment.obligation_id,
        amount: typeof sanitizedInstallment.amount
      });

      const { data, error } = await supabase
        .from("installments")
        .insert([sanitizedInstallment])
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
