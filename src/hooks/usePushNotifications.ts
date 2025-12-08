import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface NotificationPayload {
    title: string;
    body: string;
    icon?: string;
    tag?: string;
    requireInteraction?: boolean;
    data?: Record<string, unknown>;
}

interface UseNotificationsReturn {
    permission: NotificationPermission | 'unsupported';
    isSupported: boolean;
    requestPermission: () => Promise<boolean>;
    sendNotification: (payload: NotificationPayload) => Notification | null;
    scheduleNotification: (payload: NotificationPayload, delayMs: number) => ReturnType<typeof setTimeout>;
}

/**
 * Hook para gerenciar notificações do navegador.
 * 
 * @example
 * const { permission, requestPermission, sendNotification } = usePushNotifications();
 * 
 * // Solicitar permissão
 * await requestPermission();
 * 
 * // Enviar notificação
 * sendNotification({
 *   title: 'Prazo vencendo!',
 *   body: 'O prazo X vence amanhã',
 * });
 */
export function usePushNotifications(): UseNotificationsReturn {
    const { toast } = useToast();
    const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
        'Notification' in window ? Notification.permission : 'unsupported'
    );

    const isSupported = 'Notification' in window;

    // Atualizar permissão quando mudar
    useEffect(() => {
        if (!isSupported) return;

        // Alguns navegadores suportam change event
        const handlePermissionChange = () => {
            setPermission(Notification.permission);
        };

        // Verificar periodicamente (fallback para navegadores sem evento)
        const interval = setInterval(() => {
            if (Notification.permission !== permission) {
                setPermission(Notification.permission);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [isSupported, permission]);

    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (!isSupported) {
            toast({
                title: 'Notificações não suportadas',
                description: 'Seu navegador não suporta notificações push.',
                variant: 'destructive',
            });
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission === 'denied') {
            toast({
                title: 'Notificações bloqueadas',
                description: 'As notificações foram bloqueadas. Por favor, habilite nas configurações do navegador.',
                variant: 'destructive',
            });
            return false;
        }

        try {
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === 'granted') {
                toast({
                    title: 'Notificações ativadas!',
                    description: 'Você receberá alertas sobre prazos importantes.',
                });
                return true;
            } else {
                toast({
                    title: 'Permissão negada',
                    description: 'Você pode habilitar notificações nas configurações do navegador.',
                    variant: 'destructive',
                });
                return false;
            }
        } catch (error) {
            console.error('Erro ao solicitar permissão de notificação:', error);
            return false;
        }
    }, [isSupported, toast]);

    const sendNotification = useCallback((payload: NotificationPayload): Notification | null => {
        if (!isSupported || Notification.permission !== 'granted') {
            console.warn('Notificações não permitidas ou não suportadas');
            return null;
        }

        try {
            const notification = new Notification(payload.title, {
                body: payload.body,
                icon: payload.icon || '/favicon.ico',
                tag: payload.tag,
                requireInteraction: payload.requireInteraction ?? false,
                data: payload.data,
            });

            // Auto-fechar após 10 segundos se não for interativa
            if (!payload.requireInteraction) {
                setTimeout(() => notification.close(), 10000);
            }

            return notification;
        } catch (error) {
            console.error('Erro ao enviar notificação:', error);
            return null;
        }
    }, [isSupported]);

    const scheduleNotification = useCallback((
        payload: NotificationPayload,
        delayMs: number
    ): ReturnType<typeof setTimeout> => {
        return setTimeout(() => {
            sendNotification(payload);
        }, delayMs);
    }, [sendNotification]);

    return {
        permission,
        isSupported,
        requestPermission,
        sendNotification,
        scheduleNotification,
    };
}

// ============================================================================
// UTILIDADES PARA NOTIFICAÇÕES DE PRAZOS
// ============================================================================

interface DeadlineNotification {
    id: string;
    title: string;
    dueDate: string;
    clientName?: string;
    type: 'obligation' | 'tax';
}

/**
 * Envia notificação sobre um prazo específico.
 */
export function notifyDeadline(
    deadline: DeadlineNotification,
    daysUntilDue: number
): Notification | null {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return null;
    }

    let title = '';
    let body = '';

    if (daysUntilDue < 0) {
        title = '⚠️ Prazo Atrasado!';
        body = `O prazo "${deadline.title}" está atrasado há ${Math.abs(daysUntilDue)} dia(s).`;
    } else if (daysUntilDue === 0) {
        title = '🔔 Prazo Vence Hoje!';
        body = `O prazo "${deadline.title}" vence hoje.`;
    } else if (daysUntilDue === 1) {
        title = '📅 Prazo Vence Amanhã';
        body = `O prazo "${deadline.title}" vence amanhã.`;
    } else if (daysUntilDue <= 3) {
        title = '📋 Prazo Próximo';
        body = `O prazo "${deadline.title}" vence em ${daysUntilDue} dias.`;
    } else {
        title = '📌 Lembrete de Prazo';
        body = `O prazo "${deadline.title}" vence em ${daysUntilDue} dias.`;
    }

    if (deadline.clientName) {
        body += ` (${deadline.clientName})`;
    }

    try {
        return new Notification(title, {
            body,
            icon: '/favicon.ico',
            tag: `deadline-${deadline.id}`,
            requireInteraction: daysUntilDue <= 0,
            data: { deadlineId: deadline.id },
        });
    } catch (error) {
        console.error('Erro ao criar notificação:', error);
        return null;
    }
}

/**
 * Calcula quantos dias faltam para uma data.
 */
export function daysUntil(dateString: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(dateString);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Verifica se deve notificar sobre um prazo baseado nos dias restantes.
 */
export function shouldNotify(daysUntilDue: number, notificationDaysBefore: number = 3): boolean {
    // Notificar se:
    // - Atrasado (daysUntilDue < 0)
    // - Vence hoje (daysUntilDue === 0)
    // - Dentro do período de alerta (daysUntilDue <= notificationDaysBefore)
    return daysUntilDue <= notificationDaysBefore;
}
