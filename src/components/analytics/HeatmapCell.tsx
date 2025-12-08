import { ANALYTICS_COLORS } from './colors';

interface HeatmapCellProps {
    /** Valor da célula */
    value: number;
    /** Valor máximo para calcular intensidade */
    max: number;
    /** Label para tooltip */
    label: string;
}

/**
 * Célula de heatmap com cor baseada na intensidade.
 */
export function HeatmapCell({ value, max, label }: HeatmapCellProps) {
    const intensity = max > 0 ? value / max : 0;

    const bgColor = intensity > 0.7
        ? ANALYTICS_COLORS.success
        : intensity > 0.4
            ? ANALYTICS_COLORS.warning
            : intensity > 0
                ? ANALYTICS_COLORS.info
                : '#e5e7eb';

    return (
        <div
            className="aspect-square rounded-lg flex items-center justify-center text-white font-bold text-sm hover:scale-110 transition-transform cursor-pointer shadow-sm"
            style={{ backgroundColor: bgColor }}
            title={`${label}: ${value}`}
            role="gridcell"
            aria-label={`${label}: ${value}`}
        >
            {value}
        </div>
    );
}
