import { useLocalStorage } from './useStorage'
import { GIORNI_DEFAULT } from '../data/workout'

// Hook per gestire la scheda personalizzata — persistita in localStorage
export function useWorkoutData() {
  const [workoutData, setWorkoutData] = useLocalStorage('sm_workout', GIORNI_DEFAULT)

  // Aggiunge un nuovo esercizio a un giorno
  function aggiungiEsercizio(dayId, esercizio) {
    const id = 'ex_' + Date.now()
    setWorkoutData((prev) => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        esercizi: [...prev[dayId].esercizi, { ...esercizio, id }],
      },
    }))
  }

  // Modifica un esercizio esistente
  function modificaEsercizio(dayId, esercizioId, dati) {
    setWorkoutData((prev) => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        esercizi: prev[dayId].esercizi.map((e) =>
          e.id === esercizioId ? { ...e, ...dati } : e
        ),
      },
    }))
  }

  // Rimuove un esercizio
  function rimuoviEsercizio(dayId, esercizioId) {
    setWorkoutData((prev) => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        esercizi: prev[dayId].esercizi.filter((e) => e.id !== esercizioId),
      },
    }))
  }

  // Ripristina la scheda di default
  function resetWorkout() {
    setWorkoutData(GIORNI_DEFAULT)
  }

  return {
    workoutData,
    aggiungiEsercizio,
    modificaEsercizio,
    rimuoviEsercizio,
    resetWorkout,
  }
}
