import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// ============================================================================
// PAGE SKELETON - Para carregamento de páginas inteiras
// ============================================================================
interface PageSkeletonProps {
    /** Número de linhas de skeleton */
    rows?: number;
    /** Se deve mostrar o header skeleton */
    showHeader?: boolean;
    /** Se deve mostrar os cards de resumo */
    showCards?: boolean;
    /** Número de cards de resumo */
    cardCount?: number;
    className?: string;
}

export function PageSkeleton({
    rows = 5,
    showHeader = true,
    showCards = false,
    cardCount = 4,
    className,
}: PageSkeletonProps) {
    return (
        <div className={cn("space-y-6 animate-fade-in", className)}>
            {showHeader && (
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
            )}

            {showCards && (
                <div className={cn("grid gap-4", `grid-cols-1 md:grid-cols-${Math.min(cardCount, 4)}`)}>
                    {Array.from({ length: cardCount }).map((_, i) => (
                        <Skeleton key={i} className="h-28 rounded-lg" />
                    ))}
                </div>
            )}

            <div className="space-y-3">
                {Array.from({ length: rows }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-md" />
                ))}
            </div>
        </div>
    );
}

// ============================================================================
// TABLE SKELETON - Para tabelas de dados
// ============================================================================
interface TableSkeletonProps {
    /** Número de linhas */
    rows?: number;
    /** Número de colunas */
    columns?: number;
    /** Se deve mostrar o header */
    showHeader?: boolean;
    className?: string;
}

export function TableSkeleton({
    rows = 5,
    columns = 5,
    showHeader = true,
    className,
}: TableSkeletonProps) {
    return (
        <div className={cn("space-y-2", className)}>
            {showHeader && (
                <div className="flex gap-4 p-3 bg-muted/50 rounded-t-md">
                    {Array.from({ length: columns }).map((_, i) => (
                        <Skeleton key={i} className="h-4 flex-1" />
                    ))}
                </div>
            )}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-4 p-3 border-b border-border/50">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton key={colIndex} className="h-4 flex-1" />
                    ))}
                </div>
            ))}
        </div>
    );
}

// ============================================================================
// CARD SKELETON - Para cards individuais
// ============================================================================
interface CardSkeletonProps {
    /** Se deve mostrar o ícone */
    showIcon?: boolean;
    /** Se deve mostrar descrição */
    showDescription?: boolean;
    className?: string;
}

export function CardSkeleton({
    showIcon = true,
    showDescription = true,
    className,
}: CardSkeletonProps) {
    return (
        <div className={cn("p-6 rounded-lg border bg-card space-y-4", className)}>
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                {showIcon && <Skeleton className="h-5 w-5 rounded" />}
            </div>
            <Skeleton className="h-8 w-16" />
            {showDescription && <Skeleton className="h-3 w-32" />}
        </div>
    );
}

// ============================================================================
// INLINE LOADER - Para loading inline
// ============================================================================
interface InlineLoaderProps {
    /** Texto a ser exibido */
    text?: string;
    /** Tamanho do ícone */
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function InlineLoader({
    text = 'Carregando...',
    size = 'md',
    className,
}: InlineLoaderProps) {
    const sizeClasses = {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
    };

    return (
        <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
            <Loader2 className={cn("animate-spin", sizeClasses[size])} />
            {text && <span className="text-sm">{text}</span>}
        </div>
    );
}

// ============================================================================
// FULL PAGE LOADER - Para carregamento de página inteira
// ============================================================================
interface FullPageLoaderProps {
    /** Texto a ser exibido */
    text?: string;
}

export function FullPageLoader({ text = 'Carregando...' }: FullPageLoaderProps) {
    return (
        <div className="flex items-center justify-center h-screen w-full bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <p className="text-muted-foreground animate-pulse">{text}</p>
            </div>
        </div>
    );
}

// ============================================================================
// BUTTON LOADER - Para botões em estado de loading
// ============================================================================
interface ButtonLoaderProps {
    /** Tamanho do ícone */
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function ButtonLoader({ size = 'sm', className }: ButtonLoaderProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
    };

    return <Loader2 className={cn("animate-spin", sizeClasses[size], className)} />;
}
