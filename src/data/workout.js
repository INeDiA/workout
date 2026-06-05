// Dati di esempio per la scheda — modificabili dall'utente nell'app

// Palette colorblind-safe basata su Okabe-Ito:
// blue · cyan · yellow · orange · rose — distinguibili in deuteranopia, protanopia e tritanopia
export const COLORI_SESSIONE = {
  blue: {
    gradient: 'from-blue-900/30 to-gray-950',
    badge: 'bg-blue-950 text-blue-300 border border-blue-800',
    pill: 'bg-blue-600 text-white',
    bar: 'bg-blue-500',
    dot: 'bg-blue-500',
  },
  cyan: {
    gradient: 'from-cyan-900/30 to-gray-950',
    badge: 'bg-cyan-950 text-cyan-300 border border-cyan-800',
    pill: 'bg-cyan-600 text-white',
    bar: 'bg-cyan-500',
    dot: 'bg-cyan-500',
  },
  yellow: {
    gradient: 'from-yellow-900/30 to-gray-950',
    badge: 'bg-yellow-950 text-yellow-300 border border-yellow-800',
    pill: 'bg-yellow-400 text-gray-900',
    bar: 'bg-yellow-400',
    dot: 'bg-yellow-400',
  },
  orange: {
    gradient: 'from-orange-900/30 to-gray-950',
    badge: 'bg-orange-950 text-orange-300 border border-orange-800',
    pill: 'bg-orange-500 text-white',
    bar: 'bg-orange-500',
    dot: 'bg-orange-500',
  },
  rose: {
    gradient: 'from-rose-900/30 to-gray-950',
    badge: 'bg-rose-950 text-rose-300 border border-rose-800',
    pill: 'bg-rose-600 text-white',
    bar: 'bg-rose-500',
    dot: 'bg-rose-500',
  },
}

export const COLORI_LISTA = ['blue', 'cyan', 'yellow', 'orange', 'rose']

export const GIORNI_DEFAULT = {
  A: {
    id: 'A',
    nome: 'Push',
    focus: 'Petto · Tricipiti',
    emoji: '🏋️',
    colore: 'blue',
    esercizi: [
      {
        id: 'panca_manubri',
        nome: 'Panca Piana Manubri',
        serie: 4,
        reps: '8-10',
        note: 'Abbassa lentamente (2 sec eccentrica). Omoplate retratte sul banco.',
        gruppo: 'Petto',
      },
      {
        id: 'chest_press',
        nome: 'Chest Press Macchina',
        serie: 3,
        reps: '10-12',
        note: 'Gomiti a 45°. Spingi senza bloccare i gomiti in estensione.',
        gruppo: 'Petto',
      },
      {
        id: 'croci_cavi',
        nome: 'Croci Cavi Bassi',
        serie: 3,
        reps: '12-15',
        note: 'Arco nel movimento, focus sulla contrazione al centro.',
        gruppo: 'Petto',
      },
      {
        id: 'pushdown',
        nome: 'Push-down Cavi',
        serie: 3,
        reps: '12-15',
        note: "Gomiti fermi ai fianchi. Blocca l'estensione 1 secondo per massima contrazione.",
        gruppo: 'Tricipiti',
      },
      {
        id: 'dip_macchina',
        nome: 'Dip Macchina',
        serie: 3,
        reps: '10-12',
        note: 'Scendi fino a 90°. Movimento controllato sia in salita che in discesa.',
        gruppo: 'Tricipiti',
      },
      {
        id: 'french_press',
        nome: 'French Press',
        serie: 3,
        reps: '10-12',
        note: 'Gomiti fermi, abbassa il bilanciere verso la fronte. Niente slancio.',
        gruppo: 'Tricipiti',
      },
      {
        id: 'plank',
        nome: 'Plank',
        serie: 3,
        reps: '45-60 sec',
        note: 'Corpo rigido, glutei contratti. Respira regolarmente.',
        gruppo: 'Core',
        isBodyweight: true,
        isTime: true,
        isShared: true,
      },
      {
        id: 'cable_crunch',
        nome: 'Cable Crunch',
        serie: 3,
        reps: '15-20',
        note: 'Fletti solo la colonna. Focus sulla contrazione degli addominali.',
        gruppo: 'Core',
        isShared: true,
      },
    ],
  },

  B: {
    id: 'B',
    nome: 'Pull',
    focus: 'Dorsali · Bicipiti',
    emoji: '💪',
    colore: 'rose',
    esercizi: [
      {
        id: 'lat_machine',
        nome: 'Lat Machine Presa Larga',
        serie: 4,
        reps: '8-10',
        note: 'Tira verso la parte alta del petto. Deprimere le scapole prima di tirare.',
        gruppo: 'Schiena',
      },
      {
        id: 'rematore_manubrio',
        nome: 'Rematore Manubrio',
        serie: 4,
        reps: '8-10',
        note: 'Schiena parallela al suolo. Porta il gomito su e indietro.',
        gruppo: 'Schiena',
      },
      {
        id: 'seated_row',
        nome: 'Seated Cable Row',
        serie: 3,
        reps: '10-12',
        note: "Tira verso l'ombelico, stringi le scapole a fine movimento.",
        gruppo: 'Schiena',
      },
      {
        id: 'curl_ez',
        nome: 'Curl EZ',
        serie: 3,
        reps: '10-12',
        note: 'Gomiti fermi ai fianchi. Niente oscillazione del busto.',
        gruppo: 'Bicipiti',
      },
      {
        id: 'curl_martello',
        nome: 'Curl Martello',
        serie: 3,
        reps: '12',
        note: 'Presa neutra, lavora anche il brachiale.',
        gruppo: 'Bicipiti',
      },
      {
        id: 'curl_cavo',
        nome: 'Curl Cavo',
        serie: 3,
        reps: '12-15',
        note: 'Tensione costante per tutto il ROM. Eseguire lentamente.',
        gruppo: 'Bicipiti',
      },
      {
        id: 'plank',
        nome: 'Plank',
        serie: 3,
        reps: '45-60 sec',
        note: 'Corpo rigido, glutei contratti. Respira regolarmente.',
        gruppo: 'Core',
        isBodyweight: true,
        isTime: true,
        isShared: true,
      },
      {
        id: 'cable_crunch',
        nome: 'Cable Crunch',
        serie: 3,
        reps: '15-20',
        note: 'Fletti solo la colonna. Focus sulla contrazione degli addominali.',
        gruppo: 'Core',
        isShared: true,
      },
    ],
  },

  C: {
    id: 'C',
    nome: 'Legs',
    focus: 'Gambe · Spalle',
    emoji: '🦵',
    colore: 'cyan',
    esercizi: [
      {
        id: 'squat_smith',
        nome: 'Squat Smith Machine',
        serie: 4,
        reps: '8-10',
        note: 'Ginocchia verso le punte dei piedi. Scendi a 90° o oltre.',
        gruppo: 'Quadricipiti',
      },
      {
        id: 'leg_press',
        nome: 'Leg Press',
        serie: 4,
        reps: '10-12',
        note: 'Non bloccare le ginocchia. Piedi larghezza spalle.',
        gruppo: 'Quadricipiti',
      },
      {
        id: 'rdl_manubri',
        nome: 'Romanian Deadlift Manubri',
        serie: 3,
        reps: '10-12',
        note: 'Schiena neutra. Scendi fino a sentire lo stretch nei femorali.',
        gruppo: 'Femorali',
      },
      {
        id: 'leg_curl',
        nome: 'Leg Curl',
        serie: 3,
        reps: '12-15',
        note: 'Movimento controllato, pausa di 1 secondo in contrazione massima.',
        gruppo: 'Femorali',
      },
      {
        id: 'shoulder_press',
        nome: 'Shoulder Press Macchina',
        serie: 4,
        reps: '8-10',
        note: 'Contrai le scapole prima di spingere. Evita di iperestendere la schiena.',
        gruppo: 'Spalle',
      },
      {
        id: 'alzate_laterali',
        nome: 'Alzate Laterali',
        serie: 3,
        reps: '12-15',
        note: 'Pesi leggeri, pollici leggermente verso il basso. Niente slancio del busto.',
        gruppo: 'Spalle',
      },
      {
        id: 'plank',
        nome: 'Plank',
        serie: 3,
        reps: '45-60 sec',
        note: 'Corpo rigido, glutei contratti. Respira regolarmente.',
        gruppo: 'Core',
        isBodyweight: true,
        isTime: true,
        isShared: true,
      },
      {
        id: 'cable_crunch',
        nome: 'Cable Crunch',
        serie: 3,
        reps: '15-20',
        note: 'Fletti solo la colonna. Focus sulla contrazione degli addominali.',
        gruppo: 'Core',
        isShared: true,
      },
    ],
  },
}

export const SCHEDA_DEFAULT = {
  id: 'default',
  nome: 'La mia scheda',
  sessioni: [GIORNI_DEFAULT.A, GIORNI_DEFAULT.B, GIORNI_DEFAULT.C],
}

export function prossimoPiorno(sessioniCompletate, ordineSessioni) {
  const ordine = ordineSessioni || ['A', 'B', 'C']
  if (sessioniCompletate.length === 0) return ordine[0]
  const ultimo = sessioniCompletate[sessioniCompletate.length - 1]
  const idx = ordine.indexOf(ultimo.dayId)
  if (idx === -1) return ordine[0]
  return ordine[(idx + 1) % ordine.length]
}
