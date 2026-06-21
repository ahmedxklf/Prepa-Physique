self.addEventListener('install', e => {
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(self.clients.claim());
});

// Code ultra-propre et sans fonctions expérimentales destructrices
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SYNC_REMINDERS') {
        const { isCompleted, programText } = event.data;
        
        // Si la séance est entièrement cochée, on fait sauter TOUTES les notifications à l'écran
        if (isCompleted) {
            self.registration.getNotifications().then(notifications => {
                notifications.forEach(notification => {
                    if (notification.tag === 'prepa-alert') {
                        notification.close();
                    }
                });
            });
            return;
        }

        // Test d'envoi immédiat à l'activation pour valider que ça fonctionne
        self.registration.showNotification(`Ma Prépa Physique`, {
            body: `Rappels actifs pour : ${programText || 'Repos'}. Reste connecté !`,
            tag: 'prepa-alert',
            requireInteraction: true
        });
    }
});
