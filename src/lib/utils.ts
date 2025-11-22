import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  // Forçar timezone UTC para evitar que o navegador converta para local (ex: dia 20 -> dia 19)
  return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}
