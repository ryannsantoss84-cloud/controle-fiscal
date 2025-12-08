import { useEffect, useState } from 'react';
import { WifiOff, Wifi, X } from 'lucide-react';
import { useConnection } from '@/hooks/useConnection';
import { cn } from '@/lib/utils';

/**
 * Banner que aparece quando o usuário está offline.
 * Mostra um aviso para impedir operações de escrita.
 */
export function ConnectionStatus() {
    const { isOnline, wasOffline, resetWasOffline } = useConnection();
    const [showReconnected, setShowReconnected] = useState(false);

    useEffect(() => {
        if (isOnline && wasOffline) {
            setShowReconnected(true);
            const timer = setTimeout(() => {
                setShowReconnected(false);
                resetWasOffline();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isOnline, wasOffline, resetWasOffline]);

    // Não mostrar nada se estiver online e não tiver reconectado recentemente
    if (isOnline && !showReconnected) {
        return null;
    }

    return (
        <div
            className={cn(
                "fixed bottom-4 left-1/2 -translate-x-1/2 z-50",
                "px-4 py-3 rounded-lg shadow-lg",
                "flex items-center gap-3",
                "animate-slide-up",
                "transition-all duration-300",
                isOnline
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
            )}
            role="alert"
            aria-live="polite"
        >
            {isOnline ? (
                <>
                    <Wifi className="h-5 w-5" />
                    <span className="font-medium">Conexão restabelecida</span>
                </>
            ) : (
                <>
                    <WifiOff className="h-5 w-5" />
                    <div>
                        <p className="font-medium">Você está offline</p>
                        <p className="text-sm text-white/80">
                            Alterações não serão salvas até reconectar
                        </p>
                    </div>
                </>
            )}

            {showReconnected && (
                <button
                    onClick={() => {
                        setShowReconnected(false);
                        resetWasOffline();
                    }}
                    className="ml-2 p-1 hover:bg-white/20 rounded"
                    aria-label="Fechar"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
