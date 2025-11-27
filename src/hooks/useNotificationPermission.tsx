import { useEffect, useState } from "react";

export function useNotificationPermission() {
    const [permission, setPermission] = useState<NotificationPermission>("default");
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        setIsSupported("Notification" in window && "serviceWorker" in navigator);
        if ("Notification" in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if (!isSupported) {
            return false;
        }

        try {
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === "granted") {
                // Registrar service worker se ainda não estiver
                const registration = await navigator.serviceWorker.register("/service-worker.js");
                console.log("Service Worker registrado:", registration);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Erro ao solicitar permissão:", error);
            return false;
        }
    };

    const sendNotification = async (title: string, options?: NotificationOptions) => {
        if (!isSupported || permission !== "granted") {
            console.warn("Notificações não permitidas");
            return false;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(title, {
                icon: "/logo.svg",
                badge: "/logo.svg",
                ...options,
            });
            return true;
        } catch (error) {
            console.error("Erro ao enviar notificação:", error);
            return false;
        }
    };

    return {
        permission,
        isSupported,
        requestPermission,
        sendNotification,
        isGranted: permission === "granted",
    };
}
