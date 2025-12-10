/**
 * Tipo para tratamento de finais de semana
 */
export type WeekendHandling = 'next_business_day' | 'advance' | 'postpone';

/**
 * Dados de configuração do sistema
 */
export interface SettingsData {
    office_name: string;
    office_document: string;
    office_address: string;
    office_phone: string;
    office_email: string;
    default_weekend_handling: WeekendHandling;
    auto_create_recurrences: boolean;
    notification_days: number;
    items_per_page: number;
}

/**
 * Props compartilhadas entre abas de configuração
 */
export interface SettingsTabProps {
    settings: SettingsData;
    onChange: (settings: Partial<SettingsData>) => void;
}

/**
 * Props específicas para AppearanceTab
 */
export interface AppearanceTabProps extends SettingsTabProps {
    theme: string;
    setTheme: (theme: string) => void;
}

/**
 * Dados do Supabase (subset de SettingsData)
 */
export interface SupabaseSettingsData {
    office_name: string | null;
    office_document: string | null;
    default_weekend_handling: string | null;
    auto_create_recurrences: boolean | null;
}
