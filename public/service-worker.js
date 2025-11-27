// Service Worker para Notificações Push
const CACHE_NAME = 'fiscal-app-v1';

// Instalação do Service Worker
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Instalado');
    self.skipWaiting();
});

// Ativação
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Ativado');
    event.waitUntil(clients.claim());
});

// Push Notification Handler
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push recebido');

    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Controle Fiscal';
    const options = {
        body: data.body || 'Você tem uma notificação',
        icon: '/logo.svg',
        badge: '/logo.svg',
        vibrate: [200, 100, 200],
        tag: data.tag || 'fiscal-notification',
        requireInteraction: data.requireInteraction || false,
        data: {
            url: data.url || '/',
            dateOfArrival: Date.now(),
            ...data.data
        },
        actions: data.actions || [
            { action: 'view', title: 'Ver Detalhes' },
            { action: 'close', title: 'Fechar' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notificação clicada:', event.action);

    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    const urlToOpen = event.notification.data.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Se já existe uma janela aberta, focar nela
                for (const client of clientList) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Caso contrário, abrir nova janela
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Background Sync (para verificações periódicas)
self.addEventListener('sync', (event) => {
    if (event.tag === 'check-deadlines') {
        event.waitUntil(checkUpcomingDeadlines());
    }
});

async function checkUpcomingDeadlines() {
    console.log('[Service Worker] Verificando prazos...');
    // Esta função seria chamada periodicamente
    // A lógica real de verificação ficará no frontend
}
