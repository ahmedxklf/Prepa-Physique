self.addEventListener('install', e => {
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    // Boucle de vérification temporelle toutes les 10 minutes pour éviter d'être tué par le système
    setInterval(() => {
        checkTimeAndNotify();
    }, 600000); 
});

function checkTimeAndNotify() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // On ne cible que le début des heures
    if (minutes > 15) return; 

    // RÈGLE 1 : Rappel de la veille à 22h
    if (hours === 22) {
        const tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 1);
        const tomorrowProg = getDayProgram(tomorrow.getDay());
        
        if (tomorrowProg) {
            self.registration.showNotification(`Prepa ${tomorrowProg.dayName}`, {
                body: `Demain au programme : ${tomorrowProg.text}. Repose-toi bien !`,
                icon: 'icon.png'
            });
        }
    }

    // RÈGLE 2 : Boucle insistante de journée (Toutes les 2 heures entre 10h et 21h)
    const checkHours = [10, 12, 14, 16, 18, 20];
    if (checkHours.includes(hours)) {
        // En arrière-plan, on demande l'état des tâches du jour à l'application
        // Si non complété, on pousse l'alerte
        const currentProg = getDayProgram(now.getDay());
        if (currentProg && currentProg.mandatory.length > 0) {
            self.registration.showNotification(`Rappel Prépa Physique !`, {
                body: `N'oublie pas ta séance de : ${currentProg.text}. Lâche rien !`,
                tag: 'prepa-reminder',
                requireInteraction: true // Reste affiché tant que tu ne cliques pas
            });
        }
    }
}

function getDayProgram(dayOfWeek) {
    const progs = {
        1: { name: "Lundi", mandatory: ["Renfo"] },
        2: { name: "Mardi", mandatory: ["HIIT"] },
        3: { name: "Mercredi", mandatory: ["Cardio", "Renfo"] },
        4: { name: "Jeudi", mandatory: ["HIIT"] },
        5: { name: "Vendredi", mandatory: ["Cardio"] },
        6: { name: "Samedi", mandatory: ["Renfo"] },
        0: { name: "Dimanche", mandatory: [] }
    };
    
    const p = progs[dayOfWeek];
    if (p.mandatory.length === 0) return null;
    return {
        dayName: p.name,
        mandatory: p.mandatory,
        text: p.mandatory.join(' + ')
    };
}