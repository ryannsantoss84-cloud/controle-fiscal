import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export interface Client {
  id: string;
  user_id?: string;
  name: string;
  cnpj: string;
  email?: string;
  phone?: string;
  tax_regime?: "simples_nacional" | "lucro_presumido" | "lucro_real" | "mei";
  business_activity?: "commerce" | "service" | "both";
  state?: string;
  city?: string;
  status?: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

interface UseClientsOptions {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  regimeFilter?: string;
  statusFilter?: string;
}

export function useClients(options: UseClientsOptions = {}) {
  const { page = 1, pageSize = 10, searchTerm = "", regimeFilter = "all", statusFilter = "all" } = options;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["clients", page, pageSize, searchTerm, regimeFilter, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("clients")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,cnpj.ilike.%${searchTerm}%`);
      }

      if (regimeFilter && regimeFilter !== "all") {
        query = query.eq("tax_regime", regimeFilter);
      }

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;
      return {
        clients: (data as any) as Client[],
        totalCount: count || 0
      };
    },
    placeholderData: (previousData) => previousData, // Mantém dados antigos enquanto carrega novos (UX melhor)
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('public:clients')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clients' },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["clients"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const createClient = useMutation({
    mutationFn: async (client: Omit<Client, "id" | "user_id" | "created_at" | "updated_at">) => {
      // 1. Criar o cliente (sem user_id para desenvolvimento)
      const { data: newClient, error: clientError } = await supabase
        .from("clients")
        .insert([client] as any)
        .select()
        .single();

      if (clientError) throw clientError;

      // 2. Se tiver regime tributário, buscar templates e criar obrigações
      if (client.tax_regime) {
        try {
          // Buscar templates que contenham o regime do cliente
          const { data: templates } = await supabase
            .from("templates" as any)
            .select("*")
            .contains("tax_regimes", [client.tax_regime]);

          if (templates && templates.length > 0) {
            const obligationsToCreate: any[] = [];

            // Helper para ajustar final de semana
            const adjustForWeekend = (date: Date, rule: "postpone" | "anticipate" | "keep" = "postpone") => {
              const day = date.getDay();

              if (rule === "keep") return date;

              if (rule === "anticipate") {
                if (day === 0) { // Domingo -> Sexta
                  date.setDate(date.getDate() - 2);
                } else if (day === 6) { // Sábado -> Sexta
                  date.setDate(date.getDate() - 1);
                }
              } else { // postpone (default)
                if (day === 0) { // Domingo -> Segunda
                  date.setDate(date.getDate() + 1);
                } else if (day === 6) { // Sábado -> Segunda
                  date.setDate(date.getDate() + 2);
                }
              }
              return date;
            };

            templates.forEach((template: any) => {
              // Filtro de Atividade:
              let matchesActivity = true;
              if (template.business_activities && template.business_activities.length > 0) {
                if (!client.business_activity) {
                  matchesActivity = false;
                } else if (client.business_activity === 'both') {
                  // Se cliente é 'ambos', ele pega TUDO: templates de commerce, service E both
                  matchesActivity = template.business_activities.some((activity: string) =>
                    ['commerce', 'service', 'both'].includes(activity)
                  );
                } else {
                  // Cliente específico (commerce ou service)
                  matchesActivity = template.business_activities.includes(client.business_activity) ||
                    template.business_activities.includes('both');
                }
              }

              if (matchesActivity) {
                // Determinar quais itens gerar
                const items = template.items && template.items.length > 0
                  ? template.items
                  : [{
                    title: template.name,
                    description: template.description,
                    type: template.type,
                    recurrence: template.recurrence,
                    day_of_month: template.day_of_month,
                    weekend_rule: "postpone" // Default para legado
                  }];

                items.forEach((item: any) => {
                  // Calcular próxima data de vencimento
                  const today = new Date();
                  const dayOfMonth = item.day_of_month || 10;

                  // Criar data corretamente: começar com dia 1 do mês atual
                  let dueDate = new Date(today.getFullYear(), today.getMonth(), 1);

                  // Calcular o último dia do mês
                  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

                  // Usar o menor entre o dia desejado e o último dia do mês
                  // Isso garante que dia 31 em fevereiro vire dia 28/29
                  const validDay = Math.min(dayOfMonth, lastDayOfMonth);

                  // Setar o dia válido
                  dueDate.setDate(validDay);

                  // Se o dia já passou neste mês, joga para o próximo
                  if (dueDate < today) {
                    dueDate.setMonth(dueDate.getMonth() + 1);
                    // Recalcular o dia válido para o próximo mês
                    const nextMonthLastDay = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate();
                    const nextMonthValidDay = Math.min(dayOfMonth, nextMonthLastDay);
                    dueDate.setDate(nextMonthValidDay);
                  }

                  // APLICAR REGRA DE FINAL DE SEMANA CONFIGURÁVEL
                  dueDate = adjustForWeekend(dueDate, item.weekend_rule || "postpone");

                  obligationsToCreate.push({
                    client_id: newClient.id,
                    title: item.title,
                    description: item.description,
                    type: item.type,
                    recurrence: item.recurrence,
                    due_date: dueDate.toISOString().split('T')[0],
                    status: "pending",
                    amount: 0,
                  });
                });
              }
            });

            if (obligationsToCreate.length > 0) {
              const { error: obligationsError } = await supabase
                .from("obligations")
                .insert(obligationsToCreate);

              if (obligationsError) {
                console.error("Erro ao criar obrigações automáticas:", obligationsError);
              }
            }
          }
        } catch (err) {
          console.error("Erro na automação de templates:", err);
        }
      }

      return newClient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({
        title: "Cliente criado com sucesso!",
        description: "Obrigações padrão foram geradas automaticamente (se aplicável)."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar cliente",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateClient = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Client> & { id: string }) => {
      const { data, error } = await supabase
        .from("clients")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({ title: "Cliente atualizado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar cliente",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({ title: "Cliente excluído com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir cliente",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    clients: data?.clients || [],
    totalCount: data?.totalCount || 0,
    isLoading,
    createClient,
    updateClient,
    deleteClient,
  };
}
