import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export interface Deadline {
  id: string;
  user_id?: string;
  client_id: string;
  title: string;
  description?: string;
  due_date: string;
  completed_at?: string | null;
  started_at?: string | null;
  time_spent_minutes?: number | null;
  status: "pending" | "in_progress" | "completed" | "overdue";
  recurrence: "none" | "monthly" | "quarterly" | "semiannual" | "annual";
  type: "obligation" | "tax";
  notes?: string;
  responsible?: string;
  weekend_handling?: string;
  original_due_date?: string;
  reference_date?: string;
  amount?: number;
  sphere?: "federal" | "state" | "municipal";
  created_at: string;
  updated_at: string;
  clients?: {
    id: string;
    name: string;
  } | null;
}

interface UseDeadlinesOptions {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  statusFilter?: string;
  typeFilter?: string;
  clientFilter?: string;
  monthFilter?: Date;
  referenceMonthFilter?: Date;
}

export function useDeadlines(options: UseDeadlinesOptions = {}) {
  const {
    page = 1,
    pageSize = 50,
    searchTerm = "",
    statusFilter = "all",
    typeFilter = "all",
    clientFilter = "all",
    monthFilter,
    referenceMonthFilter
  } = options;

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["deadlines", page, pageSize, searchTerm, statusFilter, typeFilter, clientFilter, monthFilter, referenceMonthFilter],
    queryFn: async () => {
      let query = supabase
        .from("obligations")
        .select(`
          *,
          clients (
            id,
            name
          )
        `, { count: "exact" });

      // Filtros
      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter as any);
      }

      if (typeFilter && typeFilter !== "all") {
        query = query.eq("type", typeFilter);
      }

      if (clientFilter && clientFilter !== "all") {
        query = query.eq("client_id", clientFilter);
      }

      if (searchTerm) {
        query = query.ilike("title", `%${searchTerm}%`);
      }

      if (monthFilter) {
        const start = new Date(monthFilter.getFullYear(), monthFilter.getMonth(), 1).toISOString();
        const end = new Date(monthFilter.getFullYear(), monthFilter.getMonth() + 1, 0).toISOString();
        query = query.gte("due_date", start).lte("due_date", end);
      }

      if (referenceMonthFilter) {
        // Formato YYYY-MM para comparar com reference_date (que é string YYYY-MM-DD ou YYYY-MM)
        // Mas no banco parece ser DATE ou TEXT. O código anterior usava slice(0, 7)
        // Vamos assumir que reference_date é YYYY-MM-DD.
        // O filtro deve pegar tudo que começa com YYYY-MM
        const year = referenceMonthFilter.getFullYear();
        const month = String(referenceMonthFilter.getMonth() + 1).padStart(2, '0');
        const searchString = `${year}-${month}`;

        // Se reference_date for DATE, podemos usar gte/lte com o primeiro e ultimo dia do mes
        const start = `${searchString}-01`;
        const end = new Date(year, referenceMonthFilter.getMonth() + 1, 0).toISOString().split('T')[0];

        query = query.gte("reference_date", start).lte("reference_date", end);
      }

      // Ordenação
      query = query.order("due_date", { ascending: true });

      // Paginação
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;

      return {
        deadlines: data as Deadline[],
        totalCount: count || 0
      };
    },
    placeholderData: (previousData) => previousData,
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('public:obligations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'obligations' },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["deadlines"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const createDeadline = useMutation({
    mutationFn: async (deadline: Omit<Deadline, "id" | "user_id" | "created_at" | "updated_at" | "clients">) => {
      const { data, error } = await supabase
        .from("obligations")
        .insert([deadline])
        .select(`
          *,
          clients (
            id,
            name
          )
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deadlines"] });
      toast({ title: "Prazo criado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar prazo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateDeadline = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Deadline> & { id: string }) => {
      const { data, error } = await supabase
        .from("obligations")
        .update(updates)
        .eq("id", id)
        .select(`
          *,
          clients (
            id,
            name
          )
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deadlines"] });
      toast({ title: "Prazo atualizado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar prazo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteDeadline = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("obligations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deadlines"] });
      toast({ title: "Prazo excluído com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir prazo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    deadlines: data?.deadlines || [],
    totalCount: data?.totalCount || 0,
    isLoading,
    createDeadline,
    updateDeadline,
    deleteDeadline,
  };
}
