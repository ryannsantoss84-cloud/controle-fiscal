import { ANALYTICS_COLORS } from './colors';

interface ProgressRingProps {
    /** Percentual (0-100) */
    percent: number;
    /** Tamanho do anel em pixels */
    size?: number;
    /** Largura da linha */
    strokeWidth?: number;
    /** Cor do progresso */
    color?: string;
    /** Label inferior */
    label: string;
    /** Valor exibido no centro (abaixo do percentual) */
    value: string | number;
}

/**
 * Componente de anel de progresso circular com animação.
 */
export function ProgressRing({
    percent,
    size = 120,
    strokeWidth = 12,
    color = ANALYTICS_COLORS.primary,
    label,
    value,
}: ProgressRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percent / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth={strokeWidth}
                    />
                    {/* Progress circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-2xl font-bold">{percent}%</div>
                        <div className="text-xs text-muted-foreground">{value}</div>
                    </div>
                </div>
            </div>
            <p className="text-sm font-medium text-center">{label}</p>
        </div>
    );
}
