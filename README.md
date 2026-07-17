# Scheda Allenamento

PWA mobile-first per tracciare gli allenamenti in palestra. Registra serie e pesi esercizio per esercizio, mostra i progressi nel tempo e funziona offline. Disponibile in italiano e inglese.

---

## Funzionalità

### Primo avvio
- **Onboarding** — al primissimo avvio l'utente sceglie esplicitamente tra una scheda standard precompilata (Push/Pull/Legs) o iniziare da zero con una scheda vuota; nessuna scheda viene creata in automatico senza scelta
- **Lingua automatica** — l'app parte in inglese, a meno che la lingua del dispositivo sia l'italiano; sempre modificabile manualmente in Impostazioni

### Sessione di allenamento
- **Rotazione automatica dei giorni** — le sessioni ruotano in ordine in base al numero di "giorni di allenamento" impostato; la selezione manuale è sempre disponibile prima di iniziare
- **Tracker serie** — per ogni esercizio segna le serie completate con peso e ripetizioni; supporta esercizi a corpo libero (nessun peso), a tempo e "ad assistenza" (peso minore = prestazione migliore, es. macchine assistite)
- **Pre-compilazione pesi** — all'avvio di una sessione i pesi vengono auto-popolati con i valori dell'ultima volta che quell'esercizio è stato eseguito
- **Timer di recupero sticky** — countdown configurabile (60–180 s) che parte automaticamente alla spunta di ogni serie; basato su timestamp reale, quindi resta preciso anche se l'app va in background (cambio app, schermo bloccato)
- **Barra avanzamento** — percentuale di serie completate rispetto al totale
- **Schermo sempre acceso** — impedisce allo schermo di spegnersi durante la sessione (Screen Wake Lock API)
- **Schermata di completamento** — a fine allenamento mostra durata, serie completate, streak settimanale ed eventuali nuovi personal record rilevati automaticamente

### Gestione esercizi e sessioni
- **Swipe per gestire** — quando non c'è una sessione attiva, scorri una card esercizio per modificarla, eliminarla (con conferma) o riordinarla trascinando
- **Gestione sessioni** — rinomina, riordina, elimina o aggiungi sessioni da un pannello dedicato in Impostazioni
- **Esercizi comuni** — aggiungi un esercizio a tutte le sessioni contemporaneamente; vengono mostrati in una sezione separata in fondo alla sessione
- **Appunti personali** — ogni esercizio ha un campo note libero, salvato automaticamente

### Schede e database esercizi
- **Multi-scheda** — crea, rinomina, duplica ed elimina più schede (es. Bulk, Cut, Principiante); la scheda standard precompilata resta creabile in qualsiasi momento
- **Database di esercizi bilingue** — oltre 80 esercizi predefiniti divisi per gruppo muscolare, nomi e note tecniche disponibili in italiano e inglese, selezionabili con ricerca e filtro
- **Esercizi custom** — crea i tuoi esercizi personalizzati, salvati e riutilizzabili in tutte le schede
- **Ripristino al default** — ripristina la scheda attiva alla versione standard (Push/Pull/Legs) con doppia conferma

### Storico e progressi
- **Calendario mensile** — tab dedicata con selettore anno (per non dover scrollare mesi su mesi), giorni colorati per tipo di sessione, giorno odierno evidenziato
- **Dettaglio allenamento passato** — tocca qualsiasi giorno nel calendario per vedere serie e pesi registrati; i dati sono modificabili direttamente dalla stessa schermata
- **Streak settimanale** — settimane solari consecutive in cui è stato completato il numero di allenamenti previsto, non si azzera se la settimana corrente è ancora in corso
- **Grafici progressione** — tab separata con linea di tendenza del carico (kg) per ogni esercizio, PR evidenziati, filtrabili per sessione

### Backup e ripristino
- **Locale** — esporta schede, storico e impostazioni in un file `.json` (su iOS/Android apre il foglio di condivisione nativo, su desktop scarica il file); importa un backup precedente in qualsiasi momento
- **Google Drive** — collega il tuo account per backup/ripristino su Drive con un tap; il token di accesso si rinnova da solo in background (Google Identity Services) finché la sessione Google resta valida, senza dover riconnettersi ogni ora
- **WebDAV** — alternativa self-hosted (Nextcloud e compatibili) per chi preferisce non usare Google
- **Notifica di backup mancante** — avviso in Impostazioni se non è mai stato fatto un backup o l'ultimo risale a più di 30 giorni fa

### Impostazioni
- Pagina dedicata (non un pannello a comparsa): scheda attiva, sessioni, giorni di allenamento, durata recupero, lingua, backup, zona pericolosa
- Numero di giorni di allenamento per settimana (1–5) — determina la rotazione e il calcolo dello streak
- Selettore lingua italiano/inglese
- Reset completo dei dati con conferma a più passaggi

### PWA
- Funziona offline dopo il primo caricamento grazie al service worker (Workbox)
- Rilevamento multipiattaforma dello stato di installazione (iOS/Android): il banner e le istruzioni di installazione compaiono solo se l'app non è già installata
- Aggiornamenti automatici applicati al primo ricaricamento senza dover chiudere l'app (`skipWaiting` + `clientsClaim`)

---

## Stack tecnico

| Strumento | Versione | Ruolo |
|-----------|----------|-------|
| [React](https://react.dev) | 19 | UI e gestione stato (Context API) |
| [Vite](https://vite.dev) | 8 | Build tool e dev server |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Stile — dark mode, mobile-first |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app) | 1 | Service worker + Web App Manifest |
| [Recharts](https://recharts.org) | 3 | Grafici progressione pesi |
| [Lucide React](https://lucide.dev) | — | Icone |
| [Google Identity Services](https://developers.google.com/identity/gsi/web) | — | Rinnovo silenzioso del token OAuth per il backup su Drive |

Tutti i dati sono salvati in `localStorage` tramite un hook personalizzato. **Nessun backend proprio**: il backup cloud parla direttamente con Google Drive o con un server WebDAV a scelta dell'utente.

---

## Struttura del progetto

```
src/
├── context/
│   └── AppContext.jsx           # stato globale: sessioni, streak, rotazione giorni, lingua
├── hooks/
│   ├── useStorage.js            # persistenza localStorage con React state
│   ├── useTimer.js              # countdown basato su timestamp reale (resiste al background)
│   ├── useSchedeData.js         # CRUD schede, sessioni ed esercizi + migrazioni dati
│   ├── useBackupProvider.js      # provider di backup attivo (Google Drive / WebDAV)
│   ├── useInstallPrompt.js       # stato installazione PWA multipiattaforma
│   └── useWakeLock.js           # Screen Wake Lock API
├── i18n/
│   ├── it.js / en.js             # dizionari stringhe interfaccia
│   └── index.js                  # rilevamento lingua dispositivo
├── data/
│   ├── workout.js               # scheda predefinita Push/Pull/Legs (bilingue) + colori sessione
│   └── exerciseDatabase.js      # database 80+ esercizi bilingue, divisi per gruppo muscolare
├── utils/
│   ├── backup.js                 # helper per la notifica di backup mancante
│   ├── backupData.js             # serializzazione/deserializzazione backup .json
│   ├── googleDrive.js            # upload/download su Google Drive + backup automatico
│   ├── googleAuth.js             # rinnovo silenzioso del token Google (GIS)
│   └── webdav.js                 # provider di backup WebDAV
├── pages/
│   ├── Onboarding.jsx            # scelta scheda standard / da zero al primo avvio
│   ├── Oggi.jsx                  # sessione attiva, selettore giorno, timer sticky
│   ├── Storico.jsx               # calendario mensile + dettaglio + grafici progressione
│   └── Impostazioni.jsx          # pagina impostazioni, scheda attiva, backup, lingua
└── components/
    ├── ExerciseCard.jsx          # card esercizio con serie interattive + swipe-to-reveal
    ├── ExercisePicker.jsx        # bottom sheet selezione esercizio dal database
    ├── EditExerciseModal.jsx     # bottom sheet aggiungi/modifica esercizio custom
    ├── SessionePassataModal.jsx  # bottom sheet visualizza/modifica allenamento passato
    ├── SessionEditModal.jsx      # bottom sheet nome + emoji + colore sessione
    ├── SessioniManagerSheet.jsx  # bottom sheet rinomina/riordina/elimina sessioni
    ├── SchedeSheet.jsx           # bottom sheet gestione multi-scheda
    ├── CompletionModal.jsx       # schermata di riepilogo a fine allenamento
    ├── InstallBanner.jsx         # banner "Aggiungi alla Home Screen"
    ├── Timer.jsx / TimerPill.jsx # timer recupero (esteso e compatto)
    └── ProgressChart.jsx         # grafico Recharts per singolo esercizio
```

---

## Sviluppo locale

```bash
npm install
npm run dev      # avvia il dev server su http://localhost:5174
npm run build    # build di produzione in dist/
```

## Deploy

Configurato per **GitHub Pages** con deploy automatico via GitHub Actions a ogni push su `main`. Il base URL è `/scheda-allenamento/`.
