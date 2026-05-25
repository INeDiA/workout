import { createContext, useContext, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useStorage'
import { useWorkoutData } from '../hooks/useWorkoutData'
import { ORDINE_GIORNI } from '../data/workout'

const AppContext = createContext(null)

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

  const {
    workoutData,
    aggiungiEsercizio,
    modificaEsercizio,
    rimuoviEsercizio,
    resetWorkout,
  } = useWorkoutData()

  const oggi = dataOggi()

  const sessioniCompletate = useMemo(
    () => sessions.filter((s) => s.completed),
    [sessions]
  )

  const giornoOggi = useMemo(() => {
    if (activeSession && activeSession.date === oggi) return activeSession.dayId
    const ordine = ORDINE_GIORNI.slice(0, settings.giorniSettimana || 3)
    if (sessioniCompletate.length === 0) return ordine[0]
    const ultimo = sessioniCompletate[sessioniCompletate.length - 1]
    const idx = ordine.indexOf(ultimo.dayId)
    // Se l'ultimo giorno non è nell'ordine corrente (es. si è ridotto il numero di giorni), riparte da capo
    if (idx === -1) return ordine[0]
    return ordine[(idx + 1) % ordine.length]
  }, [activeSession, oggi, sessioniCompletate, settings.giorniSettimana])

  const streak = useMemo(() => {
    const dateSet = new Set(sessioniCompletate.map((s) => s.date))
    let count = 0
    const now = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      if (dateSet.has(dateStr)) {
        count++
      } else if (i > 0) {
        break
      }
    }
    return count
  }, [sessioniCompletate])

  function iniziaSessione(dayId) {
    const nuova = {
      id: Date.now().toString(),
      date: oggi,
      dayId,
      completed: false,
      exercises: {},
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
  }

  function abbandonaSessione() {
    setActiveSession(null)
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
        streak,
        oggi,
        workoutData,
        aggiungiEsercizio,
        modificaEsercizio,
        rimuoviEsercizio,
        resetWorkout,
        iniziaSessione,
        aggiornaEsercizio,
        aggiornaNutrizione,
        completaSessione,
        abbandonaSessione,
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
