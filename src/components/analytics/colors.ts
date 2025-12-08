// Paleta de cores moderna para Analytics
export const ANALYTICS_COLORS = {
    primary: '#6366f1',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    purple: '#a855f7',
    pink: '#ec4899',
    teal: '#14b8a6',
} as const;

export type AnalyticsColorKey = keyof typeof ANALYTICS_COLORS;
