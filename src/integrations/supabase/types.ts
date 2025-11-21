export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          created_at: string
          document: string
          email: string | null
          id: string
          name: string
          phone: string | null
          tax_regime: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          document: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          tax_regime?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          document?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          tax_regime?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      custom_recurrence_rules: {
        Row: {
          active: boolean | null
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          rule_config: Json | null
          rule_type: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          rule_config?: Json | null
          rule_type: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          rule_config?: Json | null
          rule_type?: string
        }
        Relationships: []
      }
      installments: {
        Row: {
          amount: number
          auto_created: boolean | null
          client_id: string | null
          created_at: string
          due_date: string
          id: string
          installment_number: number
          name: string | null
          obligation_id: string
          original_due_date: string | null
          paid_at: string | null
          parent_id: string | null
          protocol: string | null
          status: string
          total_installments: number
          updated_at: string
          weekend_handling: string | null
        }
        Insert: {
          amount: number
          auto_created?: boolean | null
          client_id?: string | null
          created_at?: string
          due_date: string
          id?: string
          installment_number: number
          name?: string | null
          obligation_id: string
          original_due_date?: string | null
          paid_at?: string | null
          parent_id?: string | null
          protocol?: string | null
          status?: string
          total_installments: number
          updated_at?: string
          weekend_handling?: string | null
        }
        Update: {
          amount?: number
          auto_created?: boolean | null
          client_id?: string | null
          created_at?: string
          due_date?: string
          id?: string
          installment_number?: number
          name?: string | null
          obligation_id?: string
          original_due_date?: string | null
          paid_at?: string | null
          parent_id?: string | null
          protocol?: string | null
          status?: string
          total_installments?: number
          updated_at?: string
          weekend_handling?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "installments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installments_obligation_id_fkey"
            columns: ["obligation_id"]
            isOneToOne: false
            referencedRelation: "obligations"
            referencedColumns: ["id"]
          },
        ]
      }
      obligations: {
        Row: {
          amount: number | null
          auto_created: boolean | null
          client_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string
          id: string
          notes: string | null
          original_due_date: string | null
          parent_id: string | null
          recurrence: Database["public"]["Enums"]["recurrence_type"]
          responsible: string | null
          status: Database["public"]["Enums"]["obligation_status"]
          tax_type_id: string | null
          title: string
          type: string
          updated_at: string
          user_id: string | null
          weekend_handling: string | null
        }
        Insert: {
          amount?: number | null
          auto_created?: boolean | null
          client_id: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          notes?: string | null
          original_due_date?: string | null
          parent_id?: string | null
          recurrence?: Database["public"]["Enums"]["recurrence_type"]
          responsible?: string | null
          status?: Database["public"]["Enums"]["obligation_status"]
          tax_type_id?: string | null
          title: string
          type?: string
          updated_at?: string
          user_id?: string | null
          weekend_handling?: string | null
        }
        Update: {
          amount?: number | null
          auto_created?: boolean | null
          client_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          notes?: string | null
          original_due_date?: string | null
          parent_id?: string | null
          recurrence?: Database["public"]["Enums"]["recurrence_type"]
          responsible?: string | null
          status?: Database["public"]["Enums"]["obligation_status"]
          tax_type_id?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string | null
          weekend_handling?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "obligations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obligations_tax_type_id_fkey"
            columns: ["tax_type_id"]
            isOneToOne: false
            referencedRelation: "tax_types"
            referencedColumns: ["id"]
          },
        ]
      }
      recurrence_history: {
        Row: {
          created_at: string | null
          created_by_system: boolean | null
          creation_date: string | null
          entity_id: string
          entity_type: string
          id: string
          original_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by_system?: boolean | null
          creation_date?: string | null
          entity_id: string
          entity_type: string
          id?: string
          original_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by_system?: boolean | null
          creation_date?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          original_id?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          auto_create_recurrences: boolean | null
          created_at: string | null
          default_weekend_handling: string | null
          id: string
          notification_days_before: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auto_create_recurrences?: boolean | null
          created_at?: string | null
          default_weekend_handling?: string | null
          id?: string
          notification_days_before?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auto_create_recurrences?: boolean | null
          created_at?: string | null
          default_weekend_handling?: string | null
          id?: string
          notification_days_before?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tax_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      taxes: {
        Row: {
          amount: number | null
          auto_created: boolean | null
          client_id: string
          created_at: string
          description: string | null
          due_date: string
          id: string
          notes: string | null
          original_due_date: string | null
          paid_at: string | null
          parent_id: string | null
          recurrence: string
          responsible: string | null
          status: string
          tax_type_name: string
          updated_at: string
          user_id: string | null
          weekend_handling: string | null
        }
        Insert: {
          amount?: number | null
          auto_created?: boolean | null
          client_id: string
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          notes?: string | null
          original_due_date?: string | null
          paid_at?: string | null
          parent_id?: string | null
          recurrence?: string
          responsible?: string | null
          status?: string
          tax_type_name: string
          updated_at?: string
          user_id?: string | null
          weekend_handling?: string | null
        }
        Update: {
          amount?: number | null
          auto_created?: boolean | null
          client_id?: string
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          notes?: string | null
          original_due_date?: string | null
          paid_at?: string | null
          parent_id?: string | null
          recurrence?: string
          responsible?: string | null
          status?: string
          tax_type_name?: string
          updated_at?: string
          user_id?: string | null
          weekend_handling?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "taxes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      obligation_status: "pending" | "in_progress" | "completed" | "overdue"
      recurrence_type:
        | "monthly"
        | "quarterly"
        | "semiannual"
        | "annual"
        | "none"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      obligation_status: ["pending", "in_progress", "completed", "overdue"],
      recurrence_type: ["monthly", "quarterly", "semiannual", "annual", "none"],
    },
  },
} as const
