import { ANALYTICS_COLORS } from './colors';

type HealthLevel = 'excellent' | 'good' | 'warning';

interface HealthBadgeProps {
    /** Nível de saúde do cliente */
    health: HealthLevel;
}

const healthConfig: Record<HealthLevel, { label: string; color: string; icon: string }> = {
    excellent: { label: 'Excelente', color: ANALYTICS_COLORS.success, icon: '🏆' },
    good: { label: 'Bom', color: ANALYTICS_COLORS.info, icon: '✅' },
    warning: { label: 'Atenção', color: ANALYTICS_COLORS.warning, icon: '⚠️' },
};

/**
 * Badge que indica a "saúde" de um cliente baseado em suas tarefas.
 */
export function HealthBadge({ health }: HealthBadgeProps) {
    const { label, color, icon } = healthConfig[health];

    return (
        <span
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: color }}
            role="status"
            aria-label={`Status: ${label}`}
        >
            <span aria-hidden="true">{icon}</span>
            {label}
        </span>
    );
}
