import React from 'react';
import { ProgressRingProps } from '@/types/analytics';

/**
 * Componente de anel de progresso circular
 * Memoizado para evitar re-renders desnecessários
 */
export const ProgressRing = React.memo<ProgressRingProps>(({
    percent,
    size = 120,
    strokeWidth = 12,
    color = '#6366f1',
    label,
    value
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        className="text-muted opacity-20"
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
                        className="transition-all duration-500 ease-out"
                    />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-2xl font-bold" style={{ color }}>
                            {Math.round(percent)}%
                        </div>
                    </div>
                </div>
            </div>
            <div className="text-center">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{value}</p>
            </div>
        </div>
    );
});

ProgressRing.displayName = 'ProgressRing';
