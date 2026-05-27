// Dati di esempio per la scheda — modificabili dall'utente nell'app

export const COLORI_SESSIONE = {
  blue: {
    gradient: 'from-blue-900/30 to-gray-950',
    badge: 'bg-blue-950 text-blue-300 border border-blue-800',
    pill: 'bg-blue-600 text-white',
    bar: 'bg-blue-500',
    dot: 'bg-blue-500',
  },
  purple: {
    gradient: 'from-purple-900/30 to-gray-950',
    badge: 'bg-purple-950 text-purple-300 border border-purple-800',
    pill: 'bg-purple-600 text-white',
    bar: 'bg-purple-500',
    dot: 'bg-purple-500',
  },
  green: {
    gradient: 'from-green-900/30 to-gray-950',
    badge: 'bg-green-950 text-green-300 border border-green-800',
    pill: 'bg-green-600 text-white',
    bar: 'bg-green-500',
    dot: 'bg-green-500',
  },
  orange: {
    gradient: 'from-orange-900/30 to-gray-950',
    badge: 'bg-orange-950 text-orange-300 border border-orange-800',
    pill: 'bg-orange-600 text-white',
    bar: 'bg-orange-500',
    dot: 'bg-orange-500',
  },
  red: {
    gradient: 'from-red-900/30 to-gray-950',
    badge: 'bg-red-950 text-red-300 border border-red-800',
    pill: 'bg-red-600 text-white',
    bar: 'bg-red-500',
    dot: 'bg-red-500',
  },
}

export const COLORI_LISTA = ['blue', 'purple', 'green', 'orange', 'red']

export const GIORNI_DEFAULT = {
  A: {
    id: 'A',
    nome: 'Giorno A',
    focus: 'Petto · Tricipiti · Spalle',
    emoji: '💪',
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
    ],
  },

  B: {
    id: 'B',
    nome: 'Giorno B',
    focus: 'Schiena · Bicipiti',
    emoji: '🏋️',
    colore: 'purple',
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
        id: 'face_pull',
        nome: 'Face Pull',
        serie: 3,
        reps: '15-20',
        note: 'Cavo alto, tira verso le orecchie con i gomiti in alto. Ottimo per le spalle.',
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
        serie: 2,
        reps: '15',
        note: 'Tensione costante per tutto il ROM. Eseguire lentamente.',
        gruppo: 'Bicipiti',
      },
    ],
  },

  C: {
    id: 'C',
    nome: 'Giorno C',
    focus: 'Gambe · Core',
    emoji: '🦵',
    colore: 'green',
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
        id: 'leg_extension',
        nome: 'Leg Extension',
        serie: 3,
        reps: '12-15',
        note: 'Estendi completamente, mantieni 1 secondo in cima.',
        gruppo: 'Quadricipiti',
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
      },
      {
        id: 'cable_crunch',
        nome: 'Cable Crunch',
        serie: 3,
        reps: '15-20',
        note: 'Fletti solo la colonna. Focus sulla contrazione degli addominali.',
        gruppo: 'Core',
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
