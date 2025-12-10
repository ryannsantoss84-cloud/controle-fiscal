import { LucideIcon } from 'lucide-react';

/**
 * Props para o componente ProgressRing
 * Renderiza um anel de progresso circular
 */
export interface ProgressRingProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label: string;
  value: string | number;
}

/**
 * Props para o componente StatCard
 * Card de estatística com ícone, valor e mudança percentual
 */
export interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: number;
  color: string;
  subtitle?: string;
}

/**
 * Props para o componente HeatmapCell
 * Célula do heatmap com gradiente baseado no valor
 */
export interface HeatmapCellProps {
  value: number;
  max: number;
  label: string;
}

/**
 * Níveis de saúde do cliente
 */
export type ClientHealth = 'excellent' | 'good' | 'warning' | 'critical';

/**
 * Props para o componente HealthBadge
 * Badge colorido indicando a saúde/status do cliente
 */
export interface HealthBadgeProps {
  health: ClientHealth;
}

/**
 * Dados de análise de cliente
 */
export interface ClientAnalytics {
  id: string;
  name: string;
  total_obligations: number;
  completed: number;
  pending: number;
  overdue: number;
  completion_rate: number;
  health: ClientHealth;
}

/**
 * Dados de série temporal para gráficos
 */
export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

/**
 * Dados agregados por período
 */
export interface PeriodData {
  period: string;
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}
