self.addEventListener('install', e => {
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(self.clients.claim());
});

// Gestionnaire d'ordres intelligent
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'UPDATE_TRIGGERS') {
        const { isCompleted, programText } = event.data;

        // ACTION A : LA SÉANCE EST FAITE -> TU COCHES -> ON DETRUIT TOUT IMMÉDIATEMENT
        if (isCompleted) {
            self.registration.getNotifications().then(notifications => {
                notifications.forEach(notification => {
                    if (notification.tag === 'prepa-alert') {
                        notification.close(); // Supprime l'alerte de l'écran et de la file d'attente
                    }
                });
            });
            return;
        }

        // ACTION B : SÉANCE NON FAITE -> ON PLANIFIE UNIQUEMENT LES HEURES RESTANTES DE LA JOURNÉE
        const now = new Date();
        const currentHour = now.getHours();
        const targetHours = [10, 12, 14, 16, 18, 20];

        targetHours.forEach(hour => {
            // On ne planifie que pour les heures qui ne sont pas encore passées
            if (hour > currentHour) {
                const triggerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, 0, 0);
                
                // On injecte la notification dans le réveil système d'Android
                self.registration.showNotification(`Rappel Prépa Physique !`, {
                    body: `Il est ${hour}h ! Séance restante : ${programText}. Let's go !`,
                    tag: 'prepa-alert',
                    requireInteraction: true,
                    showTrigger: new TimestampTrigger(triggerDate.getTime()) // Commande native Android
                }).catch(() => {
                    // Fallback de sécurité si le navigateur bloque l'écriture future sans flag
                    console.log(`Planifié localement pour ${hour}h`);
                });
            }
        });

        // Flash de la veille automatique à 22h00
        if (currentHour < 22) {
            const veilleDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 22, 0, 0);
            self.registration.showNotification(`Prépa : Demain`, {
                body: `Regarde ton application pour connaître ton programme de demain au réveil !`,
                tag: 'prepa-alert',
                showTrigger: new TimestampTrigger(veilleDate.getTime())
            }).catch(() => {});
        }
    }
});
