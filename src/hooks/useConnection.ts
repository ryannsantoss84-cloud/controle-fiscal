import { useState, useEffect, useCallback } from 'react';

interface ConnectionStatus {
    isOnline: boolean;
    wasOffline: boolean;
    lastOnline: Date | null;
}

/**
 * Hook para monitorar status da conexão de rede.
 * Detecta quando o usuário está offline e quando volta online.
 * 
 * @example
 * const { isOnline, wasOffline } = useConnection();
 * 
 * if (!isOnline) {
 *   return <OfflineBanner />;
 * }
 */
export function useConnection() {
    const [status, setStatus] = useState<ConnectionStatus>({
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
        wasOffline: false,
        lastOnline: null,
    });

    const handleOnline = useCallback(() => {
        setStatus(prev => ({
            isOnline: true,
            wasOffline: !prev.isOnline ? true : prev.wasOffline,
            lastOnline: new Date(),
        }));
    }, []);

    const handleOffline = useCallback(() => {
        setStatus(prev => ({
            ...prev,
            isOnline: false,
        }));
    }, []);

    useEffect(() => {
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [handleOnline, handleOffline]);

    const resetWasOffline = useCallback(() => {
        setStatus(prev => ({ ...prev, wasOffline: false }));
    }, []);

    return {
        ...status,
        resetWasOffline,
    };
}
