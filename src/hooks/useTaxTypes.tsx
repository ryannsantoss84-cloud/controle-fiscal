import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TaxType {
  id: string;
  user_id?: string;
  name: string;
  description?: string;
  created_at: string;
}

export function useTaxTypes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: taxTypes = [], isLoading } = useQuery({
    queryKey: ["tax_types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tax_types" as any)
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data as unknown as TaxType[];
    },
  });

  const createTaxType = useMutation({
    mutationFn: async (taxType: Omit<TaxType, "id" | "user_id" | "created_at">) => {
      const { data, error } = await supabase
        .from("tax_types" as any)
        .insert([taxType] as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax_types"] });
      toast({ title: "Tipo de imposto criado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar tipo de imposto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTaxType = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TaxType> & { id: string }) => {
      const { data, error } = await supabase
        .from("tax_types" as any)
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax_types"] });
      toast({ title: "Tipo de imposto atualizado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar tipo de imposto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTaxType = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tax_types" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax_types"] });
      toast({ title: "Tipo de imposto excluído com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir tipo de imposto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    taxTypes,
    isLoading,
    createTaxType,
    updateTaxType,
    deleteTaxType,
  };
}
