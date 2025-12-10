import React from 'react';
import { HealthBadgeProps, ClientHealth } from '@/types/analytics';

// Cores do sistema
const COLORS = {
    success: '#10b981',
    info: '#3b82f6',
    warning: '#f59e0b',
    danger: '#ef4444',
};

// Configuração de cada nível de saúde
type HealthConfig = {
    label: string;
    color: string;
    icon: string;
};

const HEALTH_CONFIG: Record<ClientHealth, HealthConfig> = {
    excellent: { label: 'Excelente', color: COLORS.success, icon: '🏆' },
    good: { label: 'Bom', color: COLORS.info, icon: '✅' },
    warning: { label: 'Atenção', color: COLORS.warning, icon: '⚠️' },
    critical: { label: 'Crítico', color: COLORS.danger, icon: '🚨' },
};

/**
 * Badge indicando a saúde/status do cliente
 * Memoizado para evitar re-renders desnecessários
 */
export const HealthBadge = React.memo<HealthBadgeProps>(({ health }) => {
    const { label, color, icon } = HEALTH_CONFIG[health];

    return (
        <span
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm"
            style={{ backgroundColor: color }}
        >
            <span>{icon}</span>
            {label}
        </span>
    );
});

HealthBadge.displayName = 'HealthBadge';
