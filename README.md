# Scheda Allenamento

PWA mobile-first per tracciare gli allenamenti in palestra. Registra serie e pesi esercizio per esercizio, mostra i progressi nel tempo e funziona offline.

---

## Funzionalità

### Sessione di allenamento
- **Rotazione automatica dei giorni** — 3 schede (A / B / C) che ruotano in ordine; la selezione manuale del giorno è sempre disponibile prima di iniziare
- **Tracker serie** — per ogni esercizio segna le serie completate con peso e ripetizioni; supporta esercizi a corpo libero (nessun peso) e a tempo
- **Timer di recupero** — countdown configurabile (60–180 s) con vibrazione al termine su dispositivi mobili
- **Barra avanzamento** — percentuale di serie completate rispetto al totale

### Scheda personalizzabile
- Aggiungi, modifica o rimuovi esercizi per ciascun giorno direttamente dall'app
- Ripristino al layout predefinito con un tap

### Storico e progressi
- **Calendario mensile** — ogni mese mostra i giorni di allenamento con colore diverso per tipo (A / B / C), il giorno odierno evidenziato e i giorni futuri sfumati
- **Streak e statistiche** — giorni consecutivi di allenamento, totale sessioni, frequenza settimanale media
- **Grafici progressione** — linea di tendenza del carico (kg) per ogni esercizio nelle ultime sessioni

### Impostazioni
- Numero di giorni di allenamento per settimana (1 / 2 / 3) — determina quante schede ruotano
- Durata recupero di default

### PWA
- Funziona offline dopo il primo caricamento grazie al service worker
- Installabile su iOS (Safari → "Aggiungi alla schermata Home") e Android (Chrome → "Installa app")

---

## Stack tecnico

| Strumento | Versione | Ruolo |
|-----------|----------|-------|
| [React](https://react.dev) | 19 | UI e gestione stato (Context API) |
| [Vite](https://vite.dev) | 8 | Build tool e dev server |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Stile — dark mode, mobile-first |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app) | — | Service worker + Web App Manifest |
| [Recharts](https://recharts.org) | 3 | Grafici progressione pesi |
| [Lucide React](https://lucide.dev) | — | Icone |

Tutti i dati (sessioni, impostazioni, scheda esercizi) sono salvati in `localStorage` tramite un hook personalizzato. **Nessun backend richiesto.**

---

## Struttura del progetto

```
src/
├── context/
│   └── AppContext.jsx        # stato globale: sessioni, streak, rotazione giorni
├── hooks/
│   ├── useStorage.js         # persistenza localStorage con React state
│   ├── useTimer.js           # countdown con vibrazione
│   └── useWorkoutData.js     # CRUD esercizi per giorno
├── data/
│   ├── workout.js            # scheda predefinita (A/B/C)
│   └── nutrition.js          # consigli nutrizionali per giorno
├── pages/
│   ├── Oggi.jsx              # sessione attiva, selettore giorno, impostazioni
│   ├── Storico.jsx           # calendario mensile + grafici progressione
│   └── Nutrizione.jsx        # diario nutrizionale giornaliero
└── components/
    ├── ExerciseCard.jsx       # card esercizio con serie interattive
    ├── Timer.jsx              # timer recupero
    ├── ProgressChart.jsx      # grafico recharts per singolo esercizio
    ├── EditExerciseModal.jsx  # bottom sheet aggiungi/modifica esercizio
    └── SettingsSheet.jsx      # bottom sheet impostazioni
```

---

## Sviluppo locale

```bash
npm install
npm run dev      # avvia il dev server su http://localhost:5173
npm run build    # build di produzione in dist/
```

## Deploy

Configurato per **GitHub Pages** con deploy automatico via GitHub Actions a ogni push su `main`. Il base URL è `/scheda-allenamento/`.
