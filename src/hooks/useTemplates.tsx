import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export interface TemplateItem {
    title: string;
    description?: string;
    type: "obligation" | "tax";
    recurrence: "none" | "monthly" | "quarterly" | "semiannual" | "annual";
    day_of_month?: number;
    weekend_rule?: "postpone" | "anticipate" | "keep";
    sphere?: "federal" | "state" | "municipal";
}

export interface Template {
    id: string;
    user_id?: string;
    name: string;
    description?: string;
    tax_regimes?: string[];
    business_activities?: string[];
    items?: TemplateItem[];
    // Campos legados para compatibilidade
    type?: "obligation" | "tax";
    recurrence?: "none" | "monthly" | "quarterly" | "semiannual" | "annual";
    day_of_month?: number;
    created_at: string;
    updated_at: string;
}

export function useTemplates() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: templates = [], isLoading } = useQuery({
        queryKey: ["templates"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("templates" as any)
                .select("*")
                .order("name", { ascending: true });

            if (error) throw error;
            return data as Template[];
        },
    });

    // Real-time subscription
    useEffect(() => {
        const channel = supabase
            .channel('public:templates')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'templates' },
                (payload) => {
                    queryClient.invalidateQueries({ queryKey: ["templates"] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    const createTemplate = useMutation({
        mutationFn: async (template: Omit<Template, "id" | "user_id" | "created_at" | "updated_at">) => {
            const { data, error } = await supabase
                .from("templates" as any)
                .insert([template])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (newTemplate) => {
            queryClient.setQueryData(["templates"], (oldData: Template[] = []) => [
                ...oldData,
                newTemplate,
            ]);
            toast({ title: "Template criado com sucesso!" });
        },
        onError: (error: Error) => {
            toast({
                title: "Erro ao criar template",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const updateTemplate = useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Template> & { id: string }) => {
            const { data, error } = await supabase
                .from("templates" as any)
                .update(updates)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (updatedTemplate) => {
            queryClient.setQueryData(["templates"], (oldData: Template[] = []) =>
                oldData.map((template) =>
                    template.id === updatedTemplate.id ? updatedTemplate : template
                )
            );
            toast({ title: "Template atualizado com sucesso!" });
        },
        onError: (error: Error) => {
            toast({
                title: "Erro ao atualizar template",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const deleteTemplate = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("templates" as any).delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: (_, deletedId) => {
            queryClient.setQueryData(["templates"], (oldData: Template[] = []) =>
                oldData.filter((template) => template.id !== deletedId)
            );
            toast({ title: "Template excluído com sucesso!" });
        },
        onError: (error: Error) => {
            toast({
                title: "Erro ao excluir template",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    return {
        templates,
        isLoading,
        createTemplate,
        updateTemplate,
        deleteTemplate,
    };
}
