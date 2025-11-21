import { Client, Obligation, ObligationStatus } from "@/types";

export const mockClients: Client[] = [
  {
    id: "1",
    name: "Empresa Alpha Ltda",
    document: "12.345.678/0001-90",
    email: "contato@alpha.com.br",
    phone: "(11) 98765-4321",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "Beta Comércio SA",
    document: "98.765.432/0001-10",
    email: "fiscal@beta.com.br",
    phone: "(11) 91234-5678",
    createdAt: new Date("2024-02-20"),
  },
  {
    id: "3",
    name: "Gamma Serviços Eireli",
    document: "11.222.333/0001-44",
    email: "contabil@gamma.com.br",
    phone: "(11) 99887-6655",
    createdAt: new Date("2024-03-10"),
  },
];

const getStatus = (dueDate: Date, completedDate?: Date): ObligationStatus => {
  if (completedDate) return "completed";
  const today = new Date();
  const due = new Date(dueDate);
  if (due < today) return "overdue";
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 7) return "in_progress";
  return "pending";
};

export const mockObligations: Obligation[] = [
  {
    id: "1",
    title: "DCTF - Declaração de Débitos",
    description: "Declaração de Débitos e Créditos Tributários Federais",
    clientId: "1",
    clientName: "Empresa Alpha Ltda",
    taxType: "Federal",
    dueDate: new Date("2025-10-15"),
    status: getStatus(new Date("2025-10-15")),
    recurrence: "monthly",
    createdAt: new Date("2024-09-01"),
    updatedAt: new Date("2024-09-01"),
  },
  {
    id: "2",
    title: "SPED Fiscal",
    description: "Escrituração Fiscal Digital",
    clientId: "1",
    clientName: "Empresa Alpha Ltda",
    taxType: "Estadual",
    dueDate: new Date("2025-10-20"),
    status: getStatus(new Date("2025-10-20")),
    recurrence: "monthly",
    createdAt: new Date("2024-09-01"),
    updatedAt: new Date("2024-09-01"),
  },
  {
    id: "3",
    title: "EFD Contribuições",
    description: "Escrituração Fiscal Digital das Contribuições",
    clientId: "2",
    clientName: "Beta Comércio SA",
    taxType: "Federal",
    dueDate: new Date("2025-10-10"),
    completedDate: new Date("2025-10-09"),
    status: getStatus(new Date("2025-10-10"), new Date("2025-10-09")),
    recurrence: "monthly",
    createdAt: new Date("2024-08-15"),
    updatedAt: new Date("2025-10-09"),
  },
  {
    id: "4",
    title: "DEFIS - Simples Nacional",
    description: "Declaração de Informações Socioeconômicas e Fiscais",
    clientId: "3",
    clientName: "Gamma Serviços Eireli",
    taxType: "Federal",
    dueDate: new Date("2025-10-31"),
    status: getStatus(new Date("2025-10-31")),
    recurrence: "annual",
    createdAt: new Date("2024-09-01"),
    updatedAt: new Date("2024-09-01"),
  },
  {
    id: "5",
    title: "DIRF - Declaração IRRF",
    description: "Declaração do Imposto sobre a Renda Retido na Fonte",
    clientId: "2",
    clientName: "Beta Comércio SA",
    taxType: "Federal",
    dueDate: new Date("2025-10-08"),
    status: getStatus(new Date("2025-10-08")),
    recurrence: "monthly",
    createdAt: new Date("2024-09-01"),
    updatedAt: new Date("2024-09-01"),
  },
  {
    id: "6",
    title: "GIA - Guia de Informação e Apuração",
    description: "Guia de Informação e Apuração do ICMS",
    clientId: "1",
    clientName: "Empresa Alpha Ltda",
    taxType: "Estadual",
    dueDate: new Date("2025-10-12"),
    status: getStatus(new Date("2025-10-12")),
    recurrence: "monthly",
    createdAt: new Date("2024-09-01"),
    updatedAt: new Date("2024-09-01"),
  },
];
