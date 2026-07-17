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

// Etichette visualizzate per ogni chiave di gruppo muscolare (vedi GRUPPI_MUSCOLARI in exerciseDatabase.js)
export const GRUPPO_LABELS = {
  petto: { it: 'Petto', en: 'Chest' },
  schiena: { it: 'Schiena', en: 'Back' },
  spalle: { it: 'Spalle', en: 'Shoulders' },
  bicipiti: { it: 'Bicipiti', en: 'Biceps' },
  tricipiti: { it: 'Tricipiti', en: 'Triceps' },
  quadricipiti: { it: 'Quadricipiti', en: 'Quads' },
  femorali: { it: 'Femorali', en: 'Hamstrings' },
  glutei: { it: 'Glutei', en: 'Glutes' },
  core: { it: 'Core', en: 'Core' },
  polpacci: { it: 'Polpacci', en: 'Calves' },
  avambracci: { it: 'Avambracci', en: 'Forearms' },
}

export const GIORNI_DEFAULT = {
  A: {
    id: 'A',
    nome: 'Push',
    focus: { it: 'Petto · Tricipiti', en: 'Chest · Triceps' },
    emoji: '🏋️',
    colore: 'blue',
    esercizi: [
      {
        id: 'panca_manubri',
        nome: { it: 'Panca Piana Manubri', en: 'Flat Dumbbell Bench Press' },
        serie: 4,
        reps: '8-10',
        note: {
          it: 'Abbassa lentamente (2 sec eccentrica). Omoplate retratte sul banco.',
          en: 'Lower slowly (2 sec eccentric). Shoulder blades retracted on the bench.',
        },
        gruppo: 'petto',
      },
      {
        id: 'chest_press',
        nome: { it: 'Chest Press Macchina', en: 'Machine Chest Press' },
        serie: 3,
        reps: '10-12',
        note: {
          it: 'Gomiti a 45°. Spingi senza bloccare i gomiti in estensione.',
          en: 'Elbows at 45°. Press without locking out the elbows.',
        },
        gruppo: 'petto',
      },
      {
        id: 'croci_cavi',
        nome: { it: 'Croci Cavi Bassi', en: 'Low Cable Flyes' },
        serie: 3,
        reps: '12-15',
        note: {
          it: 'Arco nel movimento, focus sulla contrazione al centro.',
          en: 'Arc the movement, focus on squeezing at the center.',
        },
        gruppo: 'petto',
      },
      {
        id: 'pushdown',
        nome: { it: 'Push-down Cavi', en: 'Cable Pushdown' },
        serie: 3,
        reps: '12-15',
        note: {
          it: "Gomiti fermi ai fianchi. Blocca l'estensione 1 secondo per massima contrazione.",
          en: 'Elbows locked at your sides. Hold the extension 1 second for maximum contraction.',
        },
        gruppo: 'tricipiti',
      },
      {
        id: 'dip_macchina',
        nome: { it: 'Dip Macchina', en: 'Machine Dip' },
        serie: 3,
        reps: '10-12',
        note: {
          it: 'Scendi fino a 90°. Movimento controllato sia in salita che in discesa.',
          en: 'Lower to 90°. Controlled movement both up and down.',
        },
        gruppo: 'tricipiti',
      },
      {
        id: 'french_press',
        nome: { it: 'French Press', en: 'French Press' },
        serie: 3,
        reps: '10-12',
        note: {
          it: 'Gomiti fermi, abbassa il bilanciere verso la fronte. Niente slancio.',
          en: 'Elbows fixed, lower the bar toward your forehead. No momentum.',
        },
        gruppo: 'tricipiti',
      },
      {
        id: 'plank',
        nome: { it: 'Plank', en: 'Plank' },
        serie: 3,
        reps: '45-60 sec',
        note: {
          it: 'Corpo rigido, glutei contratti. Respira regolarmente.',
          en: 'Rigid body, glutes engaged. Breathe steadily.',
        },
        gruppo: 'core',
        isBodyweight: true,
        isTime: true,
        isShared: true,
      },
      {
        id: 'cable_crunch',
        nome: { it: 'Cable Crunch', en: 'Cable Crunch' },
        serie: 3,
        reps: '15-20',
        note: {
          it: 'Fletti solo la colonna. Focus sulla contrazione degli addominali.',
          en: 'Flex only your spine. Focus on squeezing your abs.',
        },
        gruppo: 'core',
        isShared: true,
      },
    ],
  },

  B: {
    id: 'B',
    nome: 'Pull',
    focus: { it: 'Dorsali · Bicipiti', en: 'Back · Biceps' },
    emoji: '💪',
    colore: 'rose',
    esercizi: [
      {
        id: 'lat_machine',
        nome: { it: 'Lat Machine Presa Larga', en: 'Wide-Grip Lat Pulldown' },
        serie: 4,
        reps: '8-10',
        note: {
          it: 'Tira verso la parte alta del petto. Deprimere le scapole prima di tirare.',
          en: 'Pull toward the upper chest. Depress the shoulder blades before pulling.',
        },
        gruppo: 'schiena',
      },
      {
        id: 'rematore_manubrio',
        nome: { it: 'Rematore Manubrio', en: 'Dumbbell Row' },
        serie: 4,
        reps: '8-10',
        note: {
          it: 'Schiena parallela al suolo. Porta il gomito su e indietro.',
          en: 'Back parallel to the floor. Drive the elbow up and back.',
        },
        gruppo: 'schiena',
      },
      {
        id: 'seated_row',
        nome: { it: 'Seated Cable Row', en: 'Seated Cable Row' },
        serie: 3,
        reps: '10-12',
        note: {
          it: "Tira verso l'ombelico, stringi le scapole a fine movimento.",
          en: 'Pull toward your belly button, squeeze the shoulder blades at the end.',
        },
        gruppo: 'schiena',
      },
      {
        id: 'curl_ez',
        nome: { it: 'Curl EZ', en: 'EZ-Bar Curl' },
        serie: 3,
        reps: '10-12',
        note: {
          it: 'Gomiti fermi ai fianchi. Niente oscillazione del busto.',
          en: 'Elbows locked at your sides. No body swing.',
        },
        gruppo: 'bicipiti',
      },
      {
        id: 'curl_martello',
        nome: { it: 'Curl Martello', en: 'Hammer Curl' },
        serie: 3,
        reps: '12',
        note: {
          it: 'Presa neutra, lavora anche il brachiale.',
          en: 'Neutral grip, also targets the brachialis.',
        },
        gruppo: 'bicipiti',
      },
      {
        id: 'curl_cavo',
        nome: { it: 'Curl Cavo', en: 'Cable Curl' },
        serie: 3,
        reps: '12-15',
        note: {
          it: 'Tensione costante per tutto il ROM. Eseguire lentamente.',
          en: 'Constant tension through the full range of motion. Perform slowly.',
        },
        gruppo: 'bicipiti',
      },
      {
        id: 'plank',
        nome: { it: 'Plank', en: 'Plank' },
        serie: 3,
        reps: '45-60 sec',
        note: {
          it: 'Corpo rigido, glutei contratti. Respira regolarmente.',
          en: 'Rigid body, glutes engaged. Breathe steadily.',
        },
        gruppo: 'core',
        isBodyweight: true,
        isTime: true,
        isShared: true,
      },
      {
        id: 'cable_crunch',
        nome: { it: 'Cable Crunch', en: 'Cable Crunch' },
        serie: 3,
        reps: '15-20',
        note: {
          it: 'Fletti solo la colonna. Focus sulla contrazione degli addominali.',
          en: 'Flex only your spine. Focus on squeezing your abs.',
        },
        gruppo: 'core',
        isShared: true,
      },
    ],
  },

  C: {
    id: 'C',
    nome: 'Legs',
    focus: { it: 'Gambe · Spalle', en: 'Legs · Shoulders' },
    emoji: '🦵',
    colore: 'cyan',
    esercizi: [
      {
        id: 'squat_smith',
        nome: { it: 'Squat Smith Machine', en: 'Smith Machine Squat' },
        serie: 4,
        reps: '8-10',
        note: {
          it: 'Ginocchia verso le punte dei piedi. Scendi a 90° o oltre.',
          en: 'Knees track over your toes. Squat to 90° or beyond.',
        },
        gruppo: 'quadricipiti',
      },
      {
        id: 'leg_press',
        nome: { it: 'Leg Press', en: 'Leg Press' },
        serie: 4,
        reps: '10-12',
        note: {
          it: 'Non bloccare le ginocchia. Piedi larghezza spalle.',
          en: 'Do not lock out your knees. Feet shoulder-width apart.',
        },
        gruppo: 'quadricipiti',
      },
      {
        id: 'rdl_manubri',
        nome: { it: 'Romanian Deadlift Manubri', en: 'Dumbbell Romanian Deadlift' },
        serie: 3,
        reps: '10-12',
        note: {
          it: 'Schiena neutra. Scendi fino a sentire lo stretch nei femorali.',
          en: 'Neutral spine. Lower until you feel the stretch in your hamstrings.',
        },
        gruppo: 'femorali',
      },
      {
        id: 'leg_curl',
        nome: { it: 'Leg Curl', en: 'Leg Curl' },
        serie: 3,
        reps: '12-15',
        note: {
          it: 'Movimento controllato, pausa di 1 secondo in contrazione massima.',
          en: 'Controlled movement, hold 1 second at maximum contraction.',
        },
        gruppo: 'femorali',
      },
      {
        id: 'shoulder_press',
        nome: { it: 'Shoulder Press Macchina', en: 'Machine Shoulder Press' },
        serie: 4,
        reps: '8-10',
        note: {
          it: 'Contrai le scapole prima di spingere. Evita di iperestendere la schiena.',
          en: 'Squeeze the shoulder blades before pressing. Avoid hyperextending your back.',
        },
        gruppo: 'spalle',
      },
      {
        id: 'alzate_laterali',
        nome: { it: 'Alzate Laterali', en: 'Lateral Raises' },
        serie: 3,
        reps: '12-15',
        note: {
          it: 'Pesi leggeri, pollici leggermente verso il basso. Niente slancio del busto.',
          en: 'Light weights, thumbs pointing slightly down. No torso swing.',
        },
        gruppo: 'spalle',
      },
      {
        id: 'plank',
        nome: { it: 'Plank', en: 'Plank' },
        serie: 3,
        reps: '45-60 sec',
        note: {
          it: 'Corpo rigido, glutei contratti. Respira regolarmente.',
          en: 'Rigid body, glutes engaged. Breathe steadily.',
        },
        gruppo: 'core',
        isBodyweight: true,
        isTime: true,
        isShared: true,
      },
      {
        id: 'cable_crunch',
        nome: { it: 'Cable Crunch', en: 'Cable Crunch' },
        serie: 3,
        reps: '15-20',
        note: {
          it: 'Fletti solo la colonna. Focus sulla contrazione degli addominali.',
          en: 'Flex only your spine. Focus on squeezing your abs.',
        },
        gruppo: 'core',
        isShared: true,
      },
    ],
  },
}

export function prossimoPiorno(sessioniCompletate, ordineSessioni) {
  const ordine = ordineSessioni || ['A', 'B', 'C']
  if (sessioniCompletate.length === 0) return ordine[0]
  const ultimo = sessioniCompletate[sessioniCompletate.length - 1]
  const idx = ordine.indexOf(ultimo.dayId)
  if (idx === -1) return ordine[0]
  return ordine[(idx + 1) % ordine.length]
}
