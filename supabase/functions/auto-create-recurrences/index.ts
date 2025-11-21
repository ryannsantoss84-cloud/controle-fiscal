import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get("VITE_SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const today = new Date();
    const isFirstDayOfMonth = today.getDate() === 1;

    console.log(`Running auto-create-recurrences. Date: ${today.toISOString()}, Is first day: ${isFirstDayOfMonth}`);

    if (!isFirstDayOfMonth) {
      return new Response(
        JSON.stringify({ message: "Not the first day of month, skipping", date: today.toISOString() }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    let createdCount = 0;

    // Buscar obrigações com recorrência que foram concluídas
    const { data: obligations } = await supabaseClient
      .from("obligations")
      .select("*")
      .neq("recurrence", "none")
      .eq("status", "completed");

    console.log(`Found ${obligations?.length || 0} completed obligations with recurrence`);

    // Processar obrigações
    for (const obligation of obligations || []) {
      const shouldCreate = checkRecurrence(obligation.recurrence, today);
      if (shouldCreate) {
        const newDueDate = calculateNextDueDate(
          obligation.due_date,
          obligation.recurrence,
          obligation.weekend_handling || "next_business_day"
        );

        const { data: newObligation, error } = await supabaseClient.from("obligations").insert({
          title: obligation.title,
          description: obligation.description,
          client_id: obligation.client_id,
          tax_type_id: obligation.tax_type_id,
          due_date: newDueDate,
          status: "pending",
          recurrence: obligation.recurrence,
          amount: obligation.amount,
          notes: obligation.notes,
          responsible: obligation.responsible,
          weekend_handling: obligation.weekend_handling,
          auto_created: true,
          parent_id: obligation.id,
          completed_at: null,
        }).select().single();

        if (!error && newObligation) {
          await supabaseClient.from("recurrence_history").insert({
            entity_type: "obligation",
            entity_id: newObligation.id,
            original_id: obligation.id,
            created_by_system: true,
            creation_date: today.toISOString().split("T")[0],
          });
          createdCount++;
          console.log(`Created obligation: ${newObligation.id}`);
        }
      }
    }

    // Buscar impostos com recorrência que foram pagos
    const { data: taxes } = await supabaseClient
      .from("taxes")
      .select("*")
      .neq("recurrence", "none")
      .eq("status", "paid");

    console.log(`Found ${taxes?.length || 0} paid taxes with recurrence`);

    // Processar impostos
    for (const tax of taxes || []) {
      const shouldCreate = checkRecurrence(tax.recurrence, today);
      if (shouldCreate) {
        const newDueDate = calculateNextDueDate(
          tax.due_date,
          tax.recurrence,
          tax.weekend_handling || "next_business_day"
        );

        const { data: newTax, error } = await supabaseClient.from("taxes").insert({
          client_id: tax.client_id,
          tax_type_name: tax.tax_type_name,
          description: tax.description,
          amount: tax.amount,
          due_date: newDueDate,
          status: "pending",
          recurrence: tax.recurrence,
          notes: tax.notes,
          responsible: tax.responsible,
          weekend_handling: tax.weekend_handling,
          auto_created: true,
          parent_id: tax.id,
          paid_at: null,
        }).select().single();

        if (!error && newTax) {
          await supabaseClient.from("recurrence_history").insert({
            entity_type: "tax",
            entity_id: newTax.id,
            original_id: tax.id,
            created_by_system: true,
            creation_date: today.toISOString().split("T")[0],
          });
          createdCount++;
          console.log(`Created tax: ${newTax.id}`);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Recurrences processed", 
        createdCount,
        date: today.toISOString()
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in auto-create-recurrences:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

function checkRecurrence(recurrence: string, date: Date): boolean {
  const month = date.getMonth() + 1;
  
  switch (recurrence) {
    case "monthly":
      return true;
    case "quarterly":
      return [1, 4, 7, 10].includes(month);
    case "semiannual":
      return [1, 7].includes(month);
    case "annual":
      return month === 1;
    default:
      return false;
  }
}

function calculateNextDueDate(
  originalDate: string,
  recurrence: string,
  weekendHandling: string
): string {
  const date = new Date(originalDate);
  const today = new Date();
  
  // Manter o dia do vencimento original
  const day = date.getDate();
  const newDate = new Date(today.getFullYear(), today.getMonth(), day);

  // Ajustar se cair em final de semana
  return adjustForWeekend(newDate, weekendHandling);
}

function adjustForWeekend(date: Date, handling: string): string {
  const dayOfWeek = date.getDay();
  
  if (dayOfWeek === 0) { // Domingo
    if (handling === "advance") {
      date.setDate(date.getDate() - 2);
    } else if (handling === "postpone") {
      date.setDate(date.getDate() + 1);
    } else { // next_business_day
      date.setDate(date.getDate() + 1);
    }
  } else if (dayOfWeek === 6) { // Sábado
    if (handling === "advance") {
      date.setDate(date.getDate() - 1);
    } else if (handling === "postpone") {
      date.setDate(date.getDate() + 2);
    } else { // next_business_day
      date.setDate(date.getDate() + 2);
    }
  }
  
  return date.toISOString().split("T")[0];
}
