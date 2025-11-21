import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Deadline {
  id: string;
  user_id?: string;
  client_id: string;
  title: string;
  description?: string;
  due_date: string;
  completed_at?: string | null;
  status: "pending" | "in_progress" | "completed" | "overdue";
  recurrence: "none" | "monthly" | "quarterly" | "semiannual" | "annual";
  type: "obligation" | "tax";
  notes?: string;
  responsible?: string;
  weekend_handling?: string;
  original_due_date?: string;
  amount?: number;
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
}

export function useDeadlines(options: UseDeadlinesOptions = {}) {
  const {
    page = 1,
    pageSize = 50,
    searchTerm = "",
    statusFilter = "all",
    typeFilter = "all",
    clientFilter = "all",
    monthFilter
  } = options;

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["deadlines", page, pageSize, searchTerm, statusFilter, typeFilter, clientFilter, monthFilter],
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
        query = query.eq("status", statusFilter);
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

  const createDeadline = useMutation({
    mutationFn: async (deadline: Omit<Deadline, "id" | "user_id" | "created_at" | "updated_at" | "clients">) => {
      const { data, error } = await supabase
        .from("obligations")
        .insert([deadline])
        .select()
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
        .select()
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
