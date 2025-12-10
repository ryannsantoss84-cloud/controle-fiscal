import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { StatCardProps } from '@/types/analytics';

/**
 * Card de estatística com ícone, valor e indicador de mudança
 * Memoizado para evitar re-renders desnecessários
 */
export const StatCard = React.memo<StatCardProps>(({
    icon: Icon,
    label,
    value,
    change,
    color,
    subtitle
}) => {
    return (
        <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
            {/* Background gradient */}
            <div
                className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
                style={{ background: `linear-gradient(135deg, ${color} 0%, transparent 100%)` }}
            />

            <CardContent className="p-6">
                {/* Header com ícone e badge de mudança */}
                <div className="flex items-start justify-between mb-4">
                    <div
                        className="p-3 rounded-xl shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)` }}
                    >
                        <Icon className="w-6 h-6" style={{ color }} />
                    </div>

                    {change !== undefined && (
                        <Badge
                            variant={change >= 0 ? "default" : "destructive"}
                            className="gap-1"
                        >
                            {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {Math.abs(change)}%
                        </Badge>
                    )}
                </div>

                {/* Conteúdo */}
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium">{label}</p>
                    <p className="text-3xl font-bold tracking-tight">{value}</p>
                    {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                </div>
            </CardContent>
        </Card>
    );
});

StatCard.displayName = 'StatCard';
