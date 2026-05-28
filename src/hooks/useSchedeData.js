import { useState, useEffect } from 'react'
import { useLocalStorage } from './useStorage'
import { SCHEDA_DEFAULT, GIORNI_DEFAULT } from '../data/workout'

function generaId() {
  return Date.now().toString() + Math.random().toString(36).slice(2)
}


// Migra i dati dal vecchio formato sm_workout al nuovo formato multi-scheda
function migraVecchiDati() {
  try {
    const vecchiDati = localStorage.getItem('sm_workout')
    const vecchieSettings = localStorage.getItem('sm_settings')
    if (!vecchiDati) return null

    const workout = JSON.parse(vecchiDati)
    let giorniSettimana = 3
    if (vecchieSettings) {
      const s = JSON.parse(vecchieSettings)
      if (s.giorniSettimana) giorniSettimana = s.giorniSettimana
    }

    // Prendi le sessioni presenti nel vecchio workout (rispettando giorniSettimana)
    const ordineDefault = ['A', 'B', 'C']
    const chiavi = ordineDefault.slice(0, giorniSettimana).filter((k) => workout[k])

    const sessioni = chiavi.map((k) => workout[k])

    // Se non ci sono sessioni valide, usa il default
    if (sessioni.length === 0) return null

    return {
      id: 'migrated-' + Date.now(),
      nome: 'La mia scheda',
      sessioni,
    }
  } catch {
    return null
  }
}

export function useSchedeData() {
  // Legge, migra e inizializza lo stato in un'unica passata — prima del primo render.
  // Scrivere direttamente in localStorage durante il render (fuori dall'initializer)
  // non aggiorna il React state, causando regressioni ai dati pre-migrazione ad ogni re-render.
  const [schede, setSchede] = useState(() => {
    try {
      const stored = localStorage.getItem('sm_schede')
      if (!stored) return null
      return JSON.parse(stored)
    } catch {
      return null
    }
  })

  // Persiste schede su localStorage ad ogni aggiornamento
  useEffect(() => {
    if (schede !== null) {
      try { localStorage.setItem('sm_schede', JSON.stringify(schede)) } catch {}
    }
  }, [schede])

  const [schedaAttivaId, setSchedaAttivaId] = useLocalStorage('sm_scheda_attiva_id', null)

  // Inizializzazione al primo avvio (nessuna scheda in localStorage)
  let schedeEffettive = schede
  let idAttivo = schedaAttivaId

  if (!schedeEffettive) {
    const schedaMigrata = migraVecchiDati()
    if (schedaMigrata) {
      schedeEffettive = [schedaMigrata]
      idAttivo = schedaMigrata.id
    } else {
      schedeEffettive = [SCHEDA_DEFAULT]
      idAttivo = SCHEDA_DEFAULT.id
    }
    try {
      localStorage.setItem('sm_schede', JSON.stringify(schedeEffettive))
      localStorage.setItem('sm_scheda_attiva_id', JSON.stringify(idAttivo))
    } catch {}
  }

  const schedaAttiva =
    schedeEffettive.find((s) => s.id === idAttivo) || schedeEffettive[0]

  // workoutData: mappa { [sessioneId]: sessione } della scheda attiva
  const workoutData = Object.fromEntries(
    (schedaAttiva?.sessioni || []).map((s) => [s.id, s])
  )

  // ── Schede ──────────────────────────────────────────────────────────────────

  function setSchedaAttiva(id) {
    setSchedaAttivaId(id)
  }

  function creaScheda(nome) {
    const nuova = {
      id: generaId(),
      nome: nome || 'Nuova scheda',
      sessioni: [],
    }
    setSchede((prev) => [...(prev || schedeEffettive), nuova])
    return nuova
  }

  function rinominaScheda(id, nome) {
    setSchede((prev) =>
      (prev || schedeEffettive).map((s) => (s.id === id ? { ...s, nome } : s))
    )
  }

  function eliminaScheda(id) {
    setSchede((prev) => {
      const arr = prev || schedeEffettive
      if (arr.length <= 1) return arr // non eliminare l'ultima
      const nuove = arr.filter((s) => s.id !== id)
      // Se stava eliminando quella attiva, imposta la prima disponibile
      if (idAttivo === id) {
        const prossima = nuove[0]
        setSchedaAttivaId(prossima.id)
      }
      return nuove
    })
  }

  function duplicaScheda(id) {
    const originale = (schede || schedeEffettive).find((s) => s.id === id)
    if (!originale) return
    const copia = {
      ...originale,
      id: generaId(),
      nome: originale.nome + ' (copia)',
      sessioni: originale.sessioni.map((sess) => ({
        ...sess,
        id: sess.id, // mantieni gli stessi id sessione
        esercizi: sess.esercizi.map((e) => ({ ...e })),
      })),
    }
    setSchede((prev) => [...(prev || schedeEffettive), copia])
    return copia
  }

  // ── Sessioni ─────────────────────────────────────────────────────────────────

  function aggiungiSessione(schedaId, { nome, emoji, colore }) {
    const nuovaSessione = {
      id: generaId(),
      nome: nome || 'Nuova sessione',
      focus: nome || 'Nuova sessione',
      emoji: emoji || '💪',
      colore: colore || 'blue',
      esercizi: [],
    }
    setSchede((prev) =>
      (prev || schedeEffettive).map((s) =>
        s.id === schedaId
          ? { ...s, sessioni: [...s.sessioni, nuovaSessione] }
          : s
      )
    )
    return nuovaSessione
  }

  function rinominaSessione(schedaId, sessioneId, { nome, focus, emoji, colore }) {
    setSchede((prev) =>
      (prev || schedeEffettive).map((s) => {
        if (s.id !== schedaId) return s
        return {
          ...s,
          sessioni: s.sessioni.map((sess) =>
            sess.id === sessioneId
              ? {
                  ...sess,
                  nome: nome ?? sess.nome,
                  focus: focus ?? nome ?? sess.focus,
                  emoji: emoji ?? sess.emoji,
                  colore: colore ?? sess.colore,
                }
              : sess
          ),
        }
      })
    )
  }

  function eliminaSessione(schedaId, sessioneId) {
    setSchede((prev) =>
      (prev || schedeEffettive).map((s) => {
        if (s.id !== schedaId) return s
        if (s.sessioni.length <= 1) return s // non eliminare l'ultima
        return { ...s, sessioni: s.sessioni.filter((sess) => sess.id !== sessioneId) }
      })
    )
  }

  // ── Esercizi ─────────────────────────────────────────────────────────────────

  function aggiungiEsercizio(schedaId, sessioneId, esercizio) {
    const id = generaId()
    setSchede((prev) =>
      (prev || schedeEffettive).map((s) => {
        if (s.id !== schedaId) return s
        return {
          ...s,
          sessioni: s.sessioni.map((sess) =>
            sess.id === sessioneId
              ? { ...sess, esercizi: [...sess.esercizi, { ...esercizio, id }] }
              : sess
          ),
        }
      })
    )
  }

  function modificaEsercizio(schedaId, sessioneId, esercizioId, dati) {
    setSchede((prev) =>
      (prev || schedeEffettive).map((s) => {
        if (s.id !== schedaId) return s
        return {
          ...s,
          sessioni: s.sessioni.map((sess) =>
            sess.id === sessioneId
              ? {
                  ...sess,
                  esercizi: sess.esercizi.map((e) =>
                    e.id === esercizioId ? { ...e, ...dati } : e
                  ),
                }
              : sess
          ),
        }
      })
    )
  }

  function rimuoviEsercizio(schedaId, sessioneId, esercizioId) {
    setSchede((prev) =>
      (prev || schedeEffettive).map((s) => {
        if (s.id !== schedaId) return s
        return {
          ...s,
          sessioni: s.sessioni.map((sess) =>
            sess.id === sessioneId
              ? { ...sess, esercizi: sess.esercizi.filter((e) => e.id !== esercizioId) }
              : sess
          ),
        }
      })
    )
  }

  function riordinaEsercizi(schedaId, sessioneId, nuoviEsercizi) {
    setSchede((prev) =>
      (prev || schedeEffettive).map((s) => {
        if (s.id !== schedaId) return s
        return {
          ...s,
          sessioni: s.sessioni.map((sess) =>
            sess.id === sessioneId ? { ...sess, esercizi: nuoviEsercizi } : sess
          ),
        }
      })
    )
  }

  function resetSchedaDefault() {
    setSchede((prev) =>
      (prev || schedeEffettive).map((s) => {
        if (s.id !== schedaAttiva.id) return s
        return {
          ...s,
          sessioni: [GIORNI_DEFAULT.A, GIORNI_DEFAULT.B, GIORNI_DEFAULT.C],
        }
      })
    )
  }

  return {
    schede: schede || schedeEffettive,
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
    resetSchedaDefault,
  }
}
