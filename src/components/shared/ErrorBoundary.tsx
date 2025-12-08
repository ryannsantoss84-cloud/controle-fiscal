import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    children: ReactNode;
    /** Nome do componente/área para melhor identificação */
    name?: string;
    /** Fallback customizado */
    fallback?: ReactNode;
    /** Callback quando um erro ocorre */
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary reutilizável com UI amigável.
 * 
 * @example
 * <ErrorBoundary name="Dashboard">
 *   <Dashboard />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ errorInfo });

        // Log do erro
        console.error(`[ErrorBoundary${this.props.name ? ` - ${this.props.name}` : ''}]:`, error);
        console.error('Component stack:', errorInfo.componentStack);

        // Callback opcional
        this.props.onError?.(error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            // Fallback customizado
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // UI padrão de erro
            return (
                <Card className="border-destructive/50 bg-destructive/5">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                            Algo deu errado
                            {this.props.name && (
                                <span className="text-sm font-normal text-muted-foreground">
                                    em {this.props.name}
                                </span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Ocorreu um erro inesperado. Você pode tentar recarregar este componente
                            ou voltar para a página inicial.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="text-xs">
                                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                    Detalhes técnicos (desenvolvimento)
                                </summary>
                                <pre className="mt-2 p-3 bg-muted rounded-lg overflow-auto max-h-40 text-destructive">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={this.handleRetry}
                                className="gap-2"
                            >
                                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                                Tentar novamente
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={this.handleGoHome}
                                className="gap-2"
                            >
                                <Home className="h-4 w-4" aria-hidden="true" />
                                Página inicial
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        return this.props.children;
    }
}

/**
 * HOC para envolver componentes com Error Boundary.
 */
export function withErrorBoundary<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    name?: string
) {
    return function WithErrorBoundaryWrapper(props: P) {
        return (
            <ErrorBoundary name={name}>
                <WrappedComponent {...props} />
            </ErrorBoundary>
        );
    };
}
