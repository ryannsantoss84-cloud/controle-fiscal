import React, { useMemo } from 'react';
import { HeatmapCellProps } from '@/types/analytics';

// Paleta de cores para o heatmap
const COLORS = {
    primary: '#6366f1',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    muted: '#e5e7eb',
};

/**
 * Célula do heatmap com gradiente baseado na intensidade do valor
 * Memoizado para evitar recálculo de cor em cada render
 */
export const HeatmapCell = React.memo<HeatmapCellProps>(({
    value,
    max,
    label
}) => {
    const bgColor = useMemo(() => {
        const intensity = max > 0 ? (value / max) : 0;

        if (intensity > 0.7) return COLORS.success;
        if (intensity > 0.4) return COLORS.warning;
        if (intensity > 0) return COLORS.info;
        return COLORS.muted;
    }, [value, max]);

    return (
        <div
            className="aspect-square rounded-lg flex items-center justify-center text-white font-bold text-sm hover:scale-110 transition-transform cursor-pointer shadow-sm"
            style={{ backgroundColor: bgColor }}
            title={`${label}: ${value}`}
        >
            {value}
        </div>
    );
});

HeatmapCell.displayName = 'HeatmapCell';
