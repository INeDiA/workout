import { createContext, useContext, useMemo, useEffect } from 'react'
import { useLocalStorage } from '../hooks/useStorage'
import { useSchedeData } from '../hooks/useSchedeData'
import { useTimer } from '../hooks/useTimer'
import { autoBackup } from '../utils/googleDrive'

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
  const [settings, setSettings] = useLocalStorage('sm_settings', { timerDuration: 90, giorniSettimana: 3 })

  // Timer a livello di context — persiste attraverso i cambi di tab
  const timer = useTimer(settings.timerDuration)
  useEffect(() => { timer.changeDuration(settings.timerDuration) }, [settings.timerDuration]) // eslint-disable-line react-hooks/exhaustive-deps

  const schedeData = useSchedeData()
  const {
    schede,
    schedaAttiva,
    workoutData,
    setSchedaAttiva,
    creaScheda,
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
    resetSchedaDefault,
  } = schedeData

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

  function iniziaSessione(dayId) {
    // Pre-popola i pesi con l'ultimo valore registrato per ogni esercizio
    const esercizi = workoutData[dayId]?.esercizi || []
    const sessioni = [...sessioniCompletate].reverse() // più recenti prima
    const exercises = {}

    for (const esercizio of esercizi) {
      if (esercizio.isBodyweight) continue
      const ultima = sessioni.find(
        (s) => s.exercises[esercizio.id]?.sets?.some((set) => set.weight)
      )
      if (ultima) {
        const ultimiSet = ultima.exercises[esercizio.id].sets
        exercises[esercizio.id] = {
          sets: ultimiSet.map((set) => ({ weight: set.weight, done: false })),
        }
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
        activeSession,
        settings,
        setSettings,
        giornoOggi,
        ordineSessioni,
        streak,
        oggi,
        // Schede
        schede,
        schedaAttiva,
        workoutData,
        setSchedaAttiva,
        creaScheda,
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
        resetSchedaDefault,
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
