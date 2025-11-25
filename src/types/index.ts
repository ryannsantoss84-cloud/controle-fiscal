export type ObligationStatus = "pending" | "in_progress" | "completed" | "overdue";

export type RecurrenceType = "none" | "monthly" | "quarterly" | "semiannual" | "annual";

export interface Client {
  id: string;
  name: string;
  document: string;
  email?: string;
  phone?: string;
  createdAt: Date;
}

export interface Obligation {
  id: string;
  title: string;
  description?: string;
  clientId?: string;
  clientName?: string;
  taxType?: string;
  dueDate: Date;
  completedDate?: Date;
  status: ObligationStatus;
  recurrence: RecurrenceType;
  sphere?: "federal" | "state" | "municipal";
  createdAt: Date;
  updatedAt: Date;
}
