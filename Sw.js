self.addEventListener('install', e => {
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(self.clients.claim());
});

// Écoute les ordres de l'application principale pour envoyer des notifications au bon moment
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SYNC_REMINDERS') {
        const { isCompleted, programText } = event.data;
        
        // Si la séance est faite, on annule tous les futurs rappels de la journée
        if (isCompleted) {
            console.log("Séance validée. Rappels désactivés pour aujourd'hui.");
            return;
        }

        // Sinon, on planifie l'envoi immédiat ou décalé si l'utilisateur ouvre l'application
        const now = new Date();
        const hours = now.getHours();

        // Boucle de journée (Vérifie si on doit déclencher une alerte au moment de l'accès)
        const checkHours = [10, 12, 14, 16, 18, 20];
        if (checkHours.includes(hours) && hours < 21) {
            self.registration.showNotification(`Rappel Prépa Physique !`, {
                body: `Tu n'as pas encore validé ton : ${programText}. Ne lâche rien !`,
                tag: 'prepa-reminder',
                requireInteraction: true
            });
        }
        
        // Alerte de la veille à 22h programmée par le système
        if (hours === 22) {
            self.registration.showNotification(`Prépa de demain`, {
                body: `Pense à regarder ton programme pour être d'attaque au réveil !`,
                tag: 'prepa-veille',
                requireInteraction: true
            });
        }
    }
});
