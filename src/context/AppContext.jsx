import { createContext, useContext, useMemo, useEffect } from 'react'
import { useLocalStorage } from '../hooks/useStorage'
import { useSchedeData } from '../hooks/useSchedeData'
import { useTimer } from '../hooks/useTimer'
import { autoBackup } from '../utils/googleDrive'
import { trovaUltimiPesi, chiaveStorico } from '../utils/ultimiPesi'
import { LINGUE, rilevaLinguaDispositivo } from '../i18n'

const AppContext = createContext(null)

function lunediDellaSettimana(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const day = date.getDay() || 7
  date.setDate(date.getDate() - (day - 1))
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

// Usa ora locale invece di UTC per evitare che a mezzanotte dia "ieri"
function dataOggi() {
  const d = new Date()
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

export function AppProvider({ children }) {
  const [sessions, setSessions] = useLocalStorage('sm_sessions', [])
  const [activeSession, setActiveSession] = useLocalStorage('sm_active_session', null)
  const [settings, setSettings] = useLocalStorage('sm_settings', {
    timerDuration: 90,
    giorniSettimana: 3,
    lingua: rilevaLinguaDispositivo(),
  })
  // Storico pesi indicizzato per nome esercizio — indipendente da quale scheda/
  // sessione/id lo ha generato, sopravvive alla cancellazione di una scheda
  const [storicoPesi, setStoricoPesi] = useLocalStorage('sm_storico_pesi', {})

  // Utenti legacy: sm_settings già esisteva prima dell'introduzione di `lingua`.
  // Fallback al rilevamento dispositivo se il campo manca.
  const lingua = settings.lingua ?? rilevaLinguaDispositivo()
  const t = LINGUE[lingua]

  // Timer a livello di context — persiste attraverso i cambi di tab
  const timer = useTimer(settings.timerDuration)
  useEffect(() => { timer.changeDuration(settings.timerDuration) }, [settings.timerDuration]) // eslint-disable-line react-hooks/exhaustive-deps

  // Rimuove i dati della vecchia sezione "Corpo" (peso/recovery), non più tracciati
  useEffect(() => {
    localStorage.removeItem('sm_peso_log')
    localStorage.removeItem('sm_recovery_log')
  }, [])

  const schedeData = useSchedeData(lingua)
  const {
    schede,
    schedaAttiva,
    workoutData,
    necessitaOnboarding,
    setSchedaAttiva,
    creaScheda,
    creaSchedaStandard,
    rinominaScheda,
    eliminaScheda,
    duplicaScheda,
    aggiungiSessione,
    rinominaSessione,
    eliminaSessione,
    aggiungiEsercizio,
    modificaEsercizio,
    rimuoviEsercizio,
    riordinaEsercizi,
    riordinaSessioni,
  } = schedeData

  // Migrazione una tantum: ricostruisce sm_storico_pesi dalle sessioni già
  // completate, risolvendo id→nome nelle schede ancora esistenti (best-effort:
  // una scheda già cancellata prima di questo aggiornamento non è recuperabile)
  useEffect(() => {
    if (localStorage.getItem('sm_storico_pesi_migrato')) return
    localStorage.setItem('sm_storico_pesi_migrato', 'true')

    try {
      setStoricoPesi((prev) => {
        const aggiornato = { ...prev }
        for (const sess of sessions) {
          try {
            if (!sess.completed) continue
            let esercizi = null
            for (const s of (schede || [])) {
              const trovata = s.sessioni?.find((x) => x.id === sess.dayId)
              if (trovata) { esercizi = trovata.esercizi; break }
            }
            if (!esercizi) continue
            for (const es of esercizi) {
              if (es.isBodyweight) continue
              const set = sess.exercises[es.id]?.sets
              if (!set || !set.some((s) => s.weight)) continue
              const chiave = chiaveStorico(es)
              const esistenti = aggiornato[chiave] || []
              if (esistenti.some((e) => e.data === sess.date)) continue
              aggiornato[chiave] = [...esistenti, { data: sess.date, sets: set }]
            }
          } catch {
            // Sessione con dati inattesi: la ignora senza compromettere il resto della migrazione
          }
        }
        for (const chiave of Object.keys(aggiornato)) {
          aggiornato[chiave] = [...aggiornato[chiave]].sort((a, b) => a.data.localeCompare(b.data))
        }
        return aggiornato
      })
    } catch {
      // Migrazione fallita: nessun dato esistente viene toccato, si riparte da uno storico vuoto
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const oggi = dataOggi()

  const ordineSessioni = useMemo(
    () => (schedaAttiva?.sessioni || []).slice(0, settings.giorniSettimana ?? 3).map((s) => s.id),
    [schedaAttiva, settings.giorniSettimana]
  )

  const sessioniCompletate = useMemo(
    () => sessions.filter((s) => s.completed),
    [sessions]
  )

  const giornoOggi = useMemo(() => {
    if (activeSession && activeSession.date === oggi) return activeSession.dayId
    if (ordineSessioni.length === 0) return null
    if (sessioniCompletate.length === 0) return ordineSessioni[0]
    const ultimo = sessioniCompletate[sessioniCompletate.length - 1]
    const idx = ordineSessioni.indexOf(ultimo.dayId)
    if (idx === -1) return ordineSessioni[0]
    return ordineSessioni[(idx + 1) % ordineSessioni.length]
  }, [activeSession, oggi, sessioniCompletate, ordineSessioni])

  const streak = useMemo(() => {
    const conteggioPerSettimana = {}
    for (const s of sessioniCompletate) {
      const key = lunediDellaSettimana(s.date)
      conteggioPerSettimana[key] = (conteggioPerSettimana[key] || 0) + 1
    }
    const target = settings.giorniSettimana ?? 3
    const now = new Date()
    const dayNow = now.getDay() || 7
    const lunediOggi = new Date(now)
    lunediOggi.setDate(now.getDate() - (dayNow - 1))
    let count = 0
    for (let i = 0; i < 52; i++) {
      const d = new Date(lunediOggi)
      d.setDate(lunediOggi.getDate() - i * 7)
      const key = [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, '0'),
        String(d.getDate()).padStart(2, '0'),
      ].join('-')
      const sessioni = conteggioPerSettimana[key] || 0
      if (sessioni >= target) {
        count++
      } else if (i === 0) {
        continue
      } else {
        break
      }
    }
    return count
  }, [sessioniCompletate, settings.giorniSettimana])

  // Record di sempre: la striscia più lunga di settimane consecutive (storiche o
  // in corso) che ha soddisfatto il target — non solo lo streak corrente
  const streakRecord = useMemo(() => {
    const conteggioPerSettimana = {}
    for (const s of sessioniCompletate) {
      const key = lunediDellaSettimana(s.date)
      conteggioPerSettimana[key] = (conteggioPerSettimana[key] || 0) + 1
    }
    const settimane = Object.keys(conteggioPerSettimana)
    if (settimane.length === 0) return streak

    const target = settings.giorniSettimana ?? 3
    const primaSettimana = new Date([...settimane].sort()[0])
    const now = new Date()
    const dayNow = now.getDay() || 7
    const lunediCorrente = new Date(now)
    lunediCorrente.setDate(now.getDate() - (dayNow - 1))

    let migliore = 0
    let corrente = 0
    for (let d = new Date(primaSettimana); d < lunediCorrente; d.setDate(d.getDate() + 7)) {
      const key = [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, '0'),
        String(d.getDate()).padStart(2, '0'),
      ].join('-')
      const sessioni = conteggioPerSettimana[key] || 0
      if (sessioni >= target) {
        corrente++
        migliore = Math.max(migliore, corrente)
      } else {
        corrente = 0
      }
    }
    return Math.max(migliore, streak)
  }, [sessioniCompletate, settings.giorniSettimana, streak])

  function iniziaSessione(dayId) {
    // Pre-popola i pesi con l'ultimo valore registrato per ogni esercizio
    const esercizi = workoutData[dayId]?.esercizi || []
    const ultimiPesi = trovaUltimiPesi(esercizi, storicoPesi)
    const exercises = {}

    for (const [esercizioId, ultimiSet] of Object.entries(ultimiPesi)) {
      exercises[esercizioId] = {
        sets: ultimiSet.map((set) => ({ weight: set.weight, done: false })),
      }
    }

    const nuova = {
      id: Date.now().toString(),
      date: oggi,
      dayId,
      completed: false,
      startedAt: Date.now(),
      exercises,
      nutrition: { pre: false, integratori: false, post: false, note: '' },
    }
    setActiveSession(nuova)
    return nuova
  }

  function aggiornaEsercizio(exerciseId, data) {
    if (!activeSession) return
    setActiveSession({
      ...activeSession,
      exercises: {
        ...activeSession.exercises,
        [exerciseId]: { ...activeSession.exercises[exerciseId], ...data },
      },
    })
  }

  function aggiornaNutrizione(data) {
    if (!activeSession) return
    setActiveSession({
      ...activeSession,
      nutrition: { ...activeSession.nutrition, ...data },
    })
  }

  function completaSessione() {
    if (!activeSession) return
    const completata = { ...activeSession, completed: true }
    setSessions((prev) => {
      const altre = prev.filter((s) => s.date !== oggi)
      return [...altre, completata]
    })

    // Alimenta lo storico pesi — indipendente da questa scheda/sessione
    const esercizi = workoutData[activeSession.dayId]?.esercizi || []
    setStoricoPesi((prev) => {
      const aggiornato = { ...prev }
      for (const es of esercizi) {
        if (es.isBodyweight) continue
        const set = activeSession.exercises[es.id]?.sets
        if (!set || !set.some((s) => s.weight)) continue
        const chiave = chiaveStorico(es)
        aggiornato[chiave] = [...(aggiornato[chiave] || []), { data: oggi, sets: set }]
      }
      return aggiornato
    })

    setActiveSession(null)
    autoBackup() // fire-and-forget, funziona con qualsiasi provider configurato
  }

  function abbandonaSessione() {
    setActiveSession(null)
  }

  function modificaSessionePassata(sessionId, exercises) {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, exercises } : s))
    )
  }

  function aggiungiSessionePassata(data, dayId) {
    const nuova = {
      id: Date.now().toString(),
      date: data,
      dayId,
      completed: true,
      exercises: {},
      nutrition: { pre: false, integratori: false, post: false, note: '' },
    }
    setSessions((prev) => {
      const altre = prev.filter((s) => s.date !== data)
      return [...altre, nuova].sort((a, b) => a.date.localeCompare(b.date))
    })
    return nuova
  }

  function eliminaSessionePassata(sessionId) {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId))
  }

  return (
    <AppContext.Provider
      value={{
        sessions,
        sessioniCompletate,
        storicoPesi,
        activeSession,
        settings,
        setSettings,
        lingua,
        t,
        giornoOggi,
        ordineSessioni,
        streak,
        streakRecord,
        oggi,
        // Schede
        schede,
        schedaAttiva,
        workoutData,
        necessitaOnboarding,
        setSchedaAttiva,
        creaScheda,
        creaSchedaStandard,
        rinominaScheda,
        eliminaScheda,
        duplicaScheda,
        // Sessioni
        aggiungiSessione,
        rinominaSessione,
        eliminaSessione,
        // Esercizi
        aggiungiEsercizio,
        modificaEsercizio,
        rimuoviEsercizio,
        riordinaEsercizi,
        riordinaSessioni,
        // Timer
        timer,
        // Sessione workout
        iniziaSessione,
        aggiornaEsercizio,
        aggiornaNutrizione,
        completaSessione,
        abbandonaSessione,
        modificaSessionePassata,
        aggiungiSessionePassata,
        eliminaSessionePassata,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp deve essere usato dentro AppProvider')
  return ctx
}
