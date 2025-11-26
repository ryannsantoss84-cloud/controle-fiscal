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
      const shouldCreate = checkRecurrence(obligation.recurrence, today, obligation.due_date);
      if (shouldCreate) {
        const newDueDate = calculateNextDueDate(
          obligation.due_date,
          obligation.recurrence,
          obligation.weekend_handling || "next_business_day"
        );

        // Verificar se já existe uma obrigação para este cliente, com mesmo título e mês/ano de vencimento
        const nextDateObj = new Date(newDueDate);
        const startOfMonth = new Date(nextDateObj.getFullYear(), nextDateObj.getMonth(), 1).toISOString();
        const endOfMonth = new Date(nextDateObj.getFullYear(), nextDateObj.getMonth() + 1, 0).toISOString();

        const { data: existingObligation } = await supabaseClient
          .from("obligations")
          .select("id")
          .eq("client_id", obligation.client_id)
          .eq("title", obligation.title)
          .gte("due_date", startOfMonth)
          .lte("due_date", endOfMonth)
          .maybeSingle();

        if (existingObligation) {
          console.log(`Skipping obligation creation: ${obligation.title} for client ${obligation.client_id} (already exists for ${newDueDate})`);
          continue;
        }

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
      const shouldCreate = checkRecurrence(tax.recurrence, today, tax.due_date);
      if (shouldCreate) {
        const newDueDate = calculateNextDueDate(
          tax.due_date,
          tax.recurrence,
          tax.weekend_handling || "next_business_day"
        );

        // Verificar se já existe um imposto para este cliente, com mesmo tipo e mês/ano de vencimento
        const nextDateObj = new Date(newDueDate);
        const startOfMonth = new Date(nextDateObj.getFullYear(), nextDateObj.getMonth(), 1).toISOString();
        const endOfMonth = new Date(nextDateObj.getFullYear(), nextDateObj.getMonth() + 1, 0).toISOString();

        const { data: existingTax } = await supabaseClient
          .from("taxes")
          .select("id")
          .eq("client_id", tax.client_id)
          .eq("tax_type_name", tax.tax_type_name)
          .gte("due_date", startOfMonth)
          .lte("due_date", endOfMonth)
          .maybeSingle();

        if (existingTax) {
          console.log(`Skipping tax creation: ${tax.tax_type_name} for client ${tax.client_id} (already exists for ${newDueDate})`);
          continue;
        }

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

function checkRecurrence(recurrence: string, date: Date, originalDateStr: string): boolean {
  const currentMonth = date.getMonth(); // 0-indexed
  const originalDate = new Date(originalDateStr);
  const originalMonth = originalDate.getMonth();

  const diffMonths = (date.getFullYear() - originalDate.getFullYear()) * 12 + (currentMonth - originalMonth);

  switch (recurrence) {
    case "monthly":
      return diffMonths > 0 && diffMonths % 1 === 0;
    case "quarterly":
      return diffMonths > 0 && diffMonths % 3 === 0;
    case "semiannual":
      return diffMonths > 0 && diffMonths % 6 === 0;
    case "annual":
      return diffMonths > 0 && diffMonths % 12 === 0;
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
  let increment = 0;

  switch (recurrence) {
    case "monthly": increment = 1; break;
    case "quarterly": increment = 3; break;
    case "semiannual": increment = 6; break;
    case "annual": increment = 12; break;
  }

  // Calculate target date by adding months to the original date
  // This preserves the day of the month (e.g. 15th)
  // Note: We need to calculate how many intervals have passed to find the *next* one relative to today
  // But the edge function runs on the 1st of the month to create obligations for *this* month.
  // So we just need to find the date in the current month that matches the day.

  const today = new Date();
  const targetDate = new Date(today.getFullYear(), today.getMonth(), date.getDate());

  // Adjust for weekend and holidays
  return adjustForWeekendAndHolidays(targetDate, weekendHandling);
}

// Feriados Nacionais 2025/2026 (Inlined for Edge Function)
const HOLIDAYS = [
  "2025-01-01", "2025-03-03", "2025-03-04", "2025-04-18", "2025-04-20", "2025-04-21",
  "2025-05-01", "2025-06-19", "2025-09-07", "2025-10-12", "2025-11-02", "2025-11-15",
  "2025-11-20", "2025-12-25",
  "2026-01-01", "2026-02-16", "2026-02-17", "2026-04-03", "2026-04-05", "2026-04-21",
  "2026-05-01", "2026-06-04", "2026-09-07", "2026-10-12", "2026-11-02", "2026-11-15",
  "2026-11-20", "2026-12-25"
];

function isHoliday(date: Date): boolean {
  const dateString = date.toISOString().split('T')[0];
  return HOLIDAYS.includes(dateString);
}

function adjustForWeekendAndHolidays(date: Date, handling: string): string {
  let adjustedDate = new Date(date);

  // Helper to check if a date is weekend or holiday
  const isWeekendOrHoliday = (d: Date) => {
    const day = d.getDay();
    return day === 0 || day === 6 || isHoliday(d);
  };

  if (!isWeekendOrHoliday(adjustedDate)) {
    return adjustedDate.toISOString().split("T")[0];
  }

  // Logic for adjustment
  if (handling === "advance") {
    while (isWeekendOrHoliday(adjustedDate)) {
      adjustedDate.setDate(adjustedDate.getDate() - 1);
    }
  } else if (handling === "postpone" || handling === "next_business_day") {
    while (isWeekendOrHoliday(adjustedDate)) {
      adjustedDate.setDate(adjustedDate.getDate() + 1);
    }
  }

  return adjustedDate.toISOString().split("T")[0];
}
