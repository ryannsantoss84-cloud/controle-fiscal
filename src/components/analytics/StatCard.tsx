import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";

interface StatCardProps {
    /** Ícone do card */
    icon: LucideIcon;
    /** Label do métrica */
    label: string;
    /** Valor principal */
    value: string | number;
    /** Mudança percentual (opcional) */
    change?: number;
    /** Cor do tema */
    color: string;
    /** Subtítulo/descrição */
    subtitle?: string;
}

/**
 * Card de estatística com ícone, valor e indicador de tendência.
 */
export function StatCard({
    icon: Icon,
    label,
    value,
    change,
    color,
    subtitle,
}: StatCardProps) {
    return (
        <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
            <div
                className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
                style={{ background: `linear-gradient(135deg, ${color} 0%, transparent 100%)` }}
            />
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div
                        className="p-3 rounded-xl shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)` }}
                    >
                        <Icon className="w-6 h-6" style={{ color }} aria-hidden="true" />
                    </div>
                    {change !== undefined && (
                        <Badge
                            variant={change >= 0 ? "default" : "destructive"}
                            className="gap-1"
                        >
                            {change >= 0 ? (
                                <TrendingUp className="w-3 h-3" aria-hidden="true" />
                            ) : (
                                <TrendingDown className="w-3 h-3" aria-hidden="true" />
                            )}
                            <span>{Math.abs(change)}%</span>
                        </Badge>
                    )}
                </div>
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium">{label}</p>
                    <p className="text-3xl font-bold tracking-tight">{value}</p>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground">{subtitle}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
