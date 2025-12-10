import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Skeleton loader detalhado para cards de métricas
 * Mantém a estrutura visual durante o carregamento
 */
export function CardSkeleton() {
    return (
        <Card className="border-none shadow-lg">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-3 w-32" />
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Skeleton para lista de itens
 */
export function ListSkeleton({ items = 3 }: { items?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: items }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                </div>
            ))}
        </div>
    );
}

/**
 * Skeleton para tabela
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-2">
            {/* Header */}
            <div className="flex gap-4 p-3 border-b">
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4 p-3 items-center">
                    <Skeleton className="h-4 w-10" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                </div>
            ))}
        </div>
    );
}
