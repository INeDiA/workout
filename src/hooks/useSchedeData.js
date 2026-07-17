import { useState, useEffect } from 'react'
import { useLocalStorage } from './useStorage'
import { GIORNI_DEFAULT, GRUPPO_LABELS } from '../data/workout'

function generaId() {
  return Date.now().toString() + Math.random().toString(36).slice(2)
}

// Risolve un esercizio del catalogo bilingue (nome/note come {it,en}, gruppo come chiave)
// in un esercizio "piatto" con stringhe nella lingua richiesta — da quel momento in poi
// è testo normale, indistinguibile da un esercizio scritto a mano dall'utente.
function risolviEsercizio(es, lingua) {
  return {
    ...es,
    nome: typeof es.nome === 'object' ? es.nome[lingua] : es.nome,
    note: typeof es.note === 'object' ? (es.note[lingua] ?? '') : (es.note || ''),
    gruppo: GRUPPO_LABELS[es.gruppo]?.[lingua] ?? es.gruppo,
  }
}

function risolviSessione(giorno, lingua) {
  return {
    ...giorno,
    nome: typeof giorno.nome === 'object' ? giorno.nome[lingua] : giorno.nome,
    focus: typeof giorno.focus === 'object' ? giorno.focus[lingua] : giorno.focus,
    esercizi: giorno.esercizi.map((es) => risolviEsercizio(es, lingua)),
  }
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

export function useSchedeData(lingua = 'en') {
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
      try {
        localStorage.setItem('sm_schede', JSON.stringify(schede))
      } catch {
        // localStorage pieno o non disponibile: la sessione continua solo in memoria
      }
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
      try {
        localStorage.setItem('sm_schede', JSON.stringify(schedeEffettive))
        localStorage.setItem('sm_scheda_attiva_id', JSON.stringify(idAttivo))
      } catch {
        // localStorage pieno o non disponibile: la sessione continua solo in memoria
      }
    } else {
      // Primo avvio senza dati legacy: nessuna scheda creata in automatico,
      // l'utente sceglie tramite la schermata di onboarding (vedi necessitaOnboarding).
      schedeEffettive = []
      idAttivo = null
    }
  }

  const necessitaOnboarding = schedeEffettive.length === 0

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
      nome: nome || (lingua === 'it' ? 'Nuova scheda' : 'New routine'),
      sessioni: [],
    }
    setSchede((prev) => [...(prev || schedeEffettive), nuova])
    return nuova
  }

  function creaSchedaStandard(nome) {
    const nuova = {
      id: generaId(),
      nome: nome || (lingua === 'it' ? 'La mia scheda' : 'My routine'),
      sessioni: [
        risolviSessione(GIORNI_DEFAULT.A, lingua),
        risolviSessione(GIORNI_DEFAULT.B, lingua),
        risolviSessione(GIORNI_DEFAULT.C, lingua),
      ],
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

  function riordinaSessioni(schedaId, nuoveSessioni) {
    setSchede((prev) =>
      (prev || schedeEffettive).map((s) =>
        s.id === schedaId ? { ...s, sessioni: nuoveSessioni } : s
      )
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
          sessioni: s.sessioni.map((sess) => {
            // Se isShared, aggiunge a tutte le sessioni con lo stesso id
            if (esercizio.isShared || sess.id === sessioneId) {
              return { ...sess, esercizi: [...sess.esercizi, { ...esercizio, id }] }
            }
            return sess
          }),
        }
      })
    )
  }

  function modificaEsercizio(schedaId, sessioneId, esercizioId, dati) {
    setSchede((prev) =>
      (prev || schedeEffettive).map((s) => {
        if (s.id !== schedaId) return s

        // Stato precedente dell'esercizio per gestire il toggle isShared
        const sessOriginale = s.sessioni.find((sess) => sess.id === sessioneId)
        const esOriginal = sessOriginale?.esercizi.find((e) => e.id === esercizioId)
        const eraShared = esOriginal?.isShared ?? false
        const saràShared = dati.isShared ?? eraShared

        return {
          ...s,
          sessioni: s.sessioni.map((sess) => {
            if (eraShared && saràShared) {
              // Rimane shared: aggiorna in tutte le sessioni
              return {
                ...sess,
                esercizi: sess.esercizi.map((e) =>
                  e.id === esercizioId ? { ...e, ...dati } : e
                ),
              }
            }
            if (!eraShared && saràShared) {
              // Diventa shared: aggiorna nella sessione corrente, propaga alle altre
              if (sess.id === sessioneId) {
                return {
                  ...sess,
                  esercizi: sess.esercizi.map((e) =>
                    e.id === esercizioId ? { ...e, ...dati } : e
                  ),
                }
              }
              // Aggiunge solo se non già presente (stesso id)
              if (sess.esercizi.some((e) => e.id === esercizioId)) return sess
              return {
                ...sess,
                esercizi: [...sess.esercizi, { ...esOriginal, ...dati }],
              }
            }
            if (eraShared && !saràShared) {
              // Non è più shared: rimuove dalle altre sessioni, aggiorna in quella corrente
              if (sess.id === sessioneId) {
                return {
                  ...sess,
                  esercizi: sess.esercizi.map((e) =>
                    e.id === esercizioId ? { ...e, ...dati } : e
                  ),
                }
              }
              return { ...sess, esercizi: sess.esercizi.filter((e) => e.id !== esercizioId) }
            }
            // Non era e rimane non-shared: solo sessione corrente
            if (sess.id !== sessioneId) return sess
            return {
              ...sess,
              esercizi: sess.esercizi.map((e) =>
                e.id === esercizioId ? { ...e, ...dati } : e
              ),
            }
          }),
        }
      })
    )
  }

  function rimuoviEsercizio(schedaId, sessioneId, esercizioId) {
    setSchede((prev) =>
      (prev || schedeEffettive).map((s) => {
        if (s.id !== schedaId) return s

        const sessOriginale = s.sessioni.find((sess) => sess.id === sessioneId)
        const isShared = sessOriginale?.esercizi.find((e) => e.id === esercizioId)?.isShared

        return {
          ...s,
          sessioni: s.sessioni.map((sess) => {
            // Se shared, rimuove da tutte le sessioni
            if (isShared || sess.id === sessioneId) {
              return { ...sess, esercizi: sess.esercizi.filter((e) => e.id !== esercizioId) }
            }
            return sess
          }),
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
          sessioni: [
            risolviSessione(GIORNI_DEFAULT.A, lingua),
            risolviSessione(GIORNI_DEFAULT.B, lingua),
            risolviSessione(GIORNI_DEFAULT.C, lingua),
          ],
        }
      })
    )
  }

  return {
    schede: schede || schedeEffettive,
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
    resetSchedaDefault,
  }
}
