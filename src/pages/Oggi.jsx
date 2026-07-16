import { useState, useEffect, useRef } from 'react'
import { Play, CheckCircle, Award, AlertTriangle, Plus, Layers2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ExerciseCard from '../components/ExerciseCard'
import Timer from '../components/Timer'
import EditExerciseModal from '../components/EditExerciseModal'
import ExercisePicker from '../components/ExercisePicker'
import SessionEditModal from '../components/SessionEditModal'
import CompletionModal from '../components/CompletionModal'
import { useWakeLock } from '../hooks/useWakeLock'
import { useEserciziCustom } from '../components/ExercisePicker'
import { COLORI_SESSIONE } from '../data/workout'

export default function Oggi() {
  const {
    giornoOggi,
    ordineSessioni,
    workoutData,
    activeSession,
    iniziaSessione,
    aggiornaEsercizio,
    completaSessione,
    schedaAttiva,
    aggiungiEsercizio,
    modificaEsercizio,
    rimuoviEsercizio,
    riordinaEsercizi,
    aggiungiSessione,
    abbandonaSessione,
    sessioniCompletate,
    streak,
    timer,
  } = useApp()

  const [giornoOverride, setGiornoOverride] = useState(null)
  const [swipedId, setSwipedId] = useState(null)
  const [confermaIncompleto, setConfermaIncompleto] = useState(false)
  const [confermaAnnulla, setConfermaAnnulla] = useState(false)

  // Esercizio modal
  const [modalEsercizio, setModalEsercizio] = useState(null) // null=chiuso, undefined=nuovo, obj=modifica
  const [showPicker, setShowPicker] = useState(false)

  // Sessione modal (solo per il primo inserimento su scheda vuota)
  const [showSessionModal, setShowSessionModal] = useState(false)

  // Esercizi custom
  const [, setEserciziCustom] = useEserciziCustom()

  // Drag & drop riordino esercizi
  const [dragId, setDragId] = useState(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [dragTargetId, setDragTargetId] = useState(null)
  const dragStartY = useRef(0)
  const dragTargetIdRef = useRef(null)
  const [showCompletionModal, setShowCompletionModal] = useState(false)

  useEffect(() => {
    if (!dragId) return

    const onMove = (e) => {
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      setDragOffset(clientY - dragStartY.current)

      // Trova la card sotto il cursore (esclusa quella trascinata)
      const elements = document.elementsFromPoint(clientX, clientY)
      let newTarget = null
      for (const el of elements) {
        const card = el.closest('[data-drag-id]')
        if (card && card.dataset.dragId !== dragId) {
          newTarget = card.dataset.dragId
          break
        }
      }
      if (newTarget !== dragTargetIdRef.current) {
        dragTargetIdRef.current = newTarget
        setDragTargetId(newTarget)
      }
    }

    const onEnd = () => {
      const targetId = dragTargetIdRef.current
      if (targetId && targetId !== dragId && giorno?.esercizi) {
        const fromItem = giorno.esercizi.find((e) => e.id === dragId)
        const toItem = giorno.esercizi.find((e) => e.id === targetId)
        // Non permettere di attraversare il confine fisso/condiviso
        if (fromItem && toItem && !!fromItem.isShared === !!toItem.isShared) {
          const arr = [...giorno.esercizi]
          const fromIdx = arr.findIndex((e) => e.id === dragId)
          const toIdx = arr.findIndex((e) => e.id === targetId)
          const [item] = arr.splice(fromIdx, 1)
          arr.splice(toIdx, 0, item)
          riordinaEsercizi(schedaAttiva.id, giornoEffettivo, arr)
        }
      }
      setDragId(null)
      setDragOffset(0)
      setDragTargetId(null)
      dragTargetIdRef.current = null
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('mouseup', onEnd)
    window.addEventListener('touchend', onEnd)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('mouseup', onEnd)
      window.removeEventListener('touchend', onEnd)
    }
  }, [dragId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Schermo sempre acceso durante la sessione
  useWakeLock(!!activeSession)

  // Se la sessione puntata da giornoOverride è stata eliminata, torna alla rotazione automatica
  useEffect(() => {
    if (giornoOverride && !workoutData[giornoOverride]) setGiornoOverride(null)
  }, [giornoOverride, workoutData])

  // Giorno effettivo
  const giornoEffettivo = giornoOverride ?? giornoOggi ?? ordineSessioni[0]
  const giorno = workoutData[giornoEffettivo]
  const colori = (giorno?.colore && COLORI_SESSIONE[giorno.colore]) || COLORI_SESSIONE.blue

  // Se non c'è nessuna sessione
  if (!giorno) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Nessuna sessione nella scheda attiva.</p>
          <button
            onClick={() => setShowSessionModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold"
          >
            Aggiungi sessione
          </button>
          {showSessionModal && (
            <SessionEditModal
              sessione={null}
              onSave={(dati) => {
                aggiungiSessione(schedaAttiva.id, dati)
                setShowSessionModal(false)
              }}
              onClose={() => setShowSessionModal(false)}
            />
          )}
        </div>
      </div>
    )
  }

  const totSerie = giorno.esercizi.reduce((sum, e) => sum + e.serie, 0)
  const serieCompletate = activeSession
    ? giorno.esercizi.reduce((sum, e) => {
        const sets = activeSession.exercises[e.id]?.sets || []
        return sum + sets.filter((s) => s.done).length
      }, 0)
    : 0
  const percentuale = totSerie > 0 ? Math.round((serieCompletate / totSerie) * 100) : 0

  function handleIniziaSessione() {
    iniziaSessione(giornoEffettivo)
    setGiornoOverride(null)
  }

  function handleComplezione() {
    if (percentuale < 50 && !confermaIncompleto) {
      setConfermaIncompleto(true)
      return
    }
    setConfermaIncompleto(false)
    setShowCompletionModal(true)
  }

  function handleConfermaCompletamento() {
    setShowCompletionModal(false)
    completaSessione()
    setGiornoOverride(null)
  }

  function handleSalvaEsercizio(dati) {
    if (modalEsercizio?.id) {
      // Modifica esercizio esistente
      modificaEsercizio(schedaAttiva.id, giornoEffettivo, modalEsercizio.id, dati)
    } else {
      // Nuovo esercizio personalizzato — salvalo anche in sm_esercizi_custom
      const id = Date.now().toString() + Math.random().toString(36).slice(2)
      const esercizioCustom = {
        ...dati,
        id,
        defaultSerie: dati.serie,
        defaultReps: dati.reps,
      }
      setEserciziCustom((prev) => [...(prev || []), esercizioCustom])
      aggiungiEsercizio(schedaAttiva.id, giornoEffettivo, dati)
    }
    setModalEsercizio(null)
  }

  function handlePickerSelect({ esercizio, addToAll }) {
    if (addToAll) {
      const esercizioCondiviso = { ...esercizio, isShared: true }
      schedaAttiva.sessioni.forEach((sessione) => {
        aggiungiEsercizio(schedaAttiva.id, sessione.id, esercizioCondiviso)
      })
    } else {
      aggiungiEsercizio(schedaAttiva.id, giornoEffettivo, esercizio)
    }
    setShowPicker(false)
  }

  function togglePill(id) {
    setGiornoOverride(giornoOverride === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-24">
      {/* Header */}
      <div className={`bg-gradient-to-b ${colori.gradient} pt-safe px-4 pb-5`}>
        <div className="pt-4 mb-3 flex items-center justify-between">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${colori.badge}`}>
            {giorno.emoji} {giorno.nome}
          </span>

          <div className="flex items-center gap-2">
            {activeSession && (
              <span className="text-xs text-gray-400 font-medium">{percentuale}%</span>
            )}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white leading-tight">{giorno.focus || giorno.nome}</h1>
        <p className="text-sm text-gray-400 mt-1">
          {giorno.esercizi.length} esercizi · {totSerie} serie totali
        </p>

        {/* Selettore sessione — visibile senza sessione attiva */}
        {!activeSession && (
          <div className="mt-4">
            {(() => {
              const sessioni = schedaAttiva?.sessioni || []
              const n = sessioni.length
              if (n === 0) return null

              const pill = (sess) => {
                const sessColori = (sess.colore && COLORI_SESSIONE[sess.colore]) || COLORI_SESSIONE.blue
                const attivo = sess.id === giornoEffettivo
                return (
                  <button
                    key={sess.id}
                    onClick={() => togglePill(sess.id)}
                    className={`w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border transition-all active:scale-95 ${
                      attivo
                        ? sessColori.pill + ' border-transparent shadow-md'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {sess.emoji && <span>{sess.emoji}</span>}
                    <span>{sess.nome}</span>
                  </button>
                )
              }

              // Fino a 3 sessioni: colonne piene equidistribuite
              if (n <= 3) {
                const gridCols = n === 1 ? 'grid-cols-1' : n === 2 ? 'grid-cols-2' : 'grid-cols-3'
                return <div className={`grid gap-2 ${gridCols}`}>{sessioni.map(pill)}</div>
              }

              // Oltre 3: righe da max 3 colonne, sempre centrate (anche l'ultima riga incompleta)
              return (
                <div className="flex flex-wrap justify-center gap-2">
                  {sessioni.map((sess) => (
                    <div key={sess.id} style={{ flex: '0 0 calc((100% - 1rem) / 3)' }}>
                      {pill(sess)}
                    </div>
                  ))}
                </div>
              )
            })()}

            {/* Indica override */}
            {giornoOverride && giornoOverride !== giornoOggi && (
              <p className="text-xs text-gray-500 mt-2">
                Rotazione automatica:{' '}
                <button
                  onClick={() => setGiornoOverride(null)}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  torna a {workoutData[giornoOggi]?.nome || giornoOggi}
                </button>
              </p>
            )}
          </div>
        )}

        {/* Barra avanzamento */}
        {activeSession && (
          <div className="mt-4 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${colori.bar} rounded-full transition-all duration-500`}
              style={{ width: `${percentuale}%` }}
            />
          </div>
        )}
      </div>

      {/* Timer sticky */}
      {activeSession && (
        <div
          className="sticky z-20 px-4 py-3 bg-gray-950 border-b border-gray-800/50"
          style={{ top: 'env(safe-area-inset-top, 0px)' }}
        >
          <Timer timer={timer} />
        </div>
      )}

      <div className="px-4 mt-4 space-y-3">
        {/* Pulsante Inizia */}
        {!activeSession && (
          <button
            onClick={handleIniziaSessione}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-semibold rounded-2xl py-4 transition-all shadow-lg shadow-blue-950"
          >
            <Play size={20} fill="white" />
            Inizia Allenamento
          </button>
        )}

        {/* Lista esercizi */}
        {(() => {
          const eserciziFissi = giorno.esercizi.filter((e) => !e.isShared)
          const eserciziCondivisi = giorno.esercizi.filter((e) => e.isShared)

          function renderEsercizio(esercizio) {
            const isDragging = esercizio.id === dragId
            const isTarget = esercizio.id === dragTargetId && !isDragging
            const puoGestire = !activeSession

            return (
              <div
                key={esercizio.id}
                data-drag-id={esercizio.id}
                className={`transition-shadow ${isTarget ? 'ring-2 ring-blue-500/50 rounded-2xl' : ''}`}
                style={isDragging ? {
                  transform: `translateY(${dragOffset}px)`,
                  zIndex: 30,
                  opacity: 0.92,
                  boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
                  borderRadius: '16px',
                  pointerEvents: 'none',
                } : {}}
              >
                <ExerciseCard
                  esercizio={esercizio}
                  datiSerie={activeSession?.exercises[esercizio.id]?.sets || []}
                  onAggiornaSerie={
                    activeSession
                      ? (sets) => {
                          const prevSets = activeSession.exercises[esercizio.id]?.sets || []
                          const nuovaSerieCompletata = sets.some(
                            (s, i) => s.done && !(prevSets[i]?.done)
                          )
                          if (nuovaSerieCompletata) timer.start()
                          aggiornaEsercizio(esercizio.id, { sets })
                        }
                      : undefined
                  }
                  onSaveMemo={(v) => modificaEsercizio(schedaAttiva.id, giornoEffettivo, esercizio.id, { memo: v })}
                  open={swipedId === esercizio.id}
                  onOpenChange={(isOpen) => setSwipedId(isOpen ? esercizio.id : null)}
                  onEdit={puoGestire ? () => setModalEsercizio(esercizio) : undefined}
                  onDelete={puoGestire ? () => rimuoviEsercizio(schedaAttiva.id, giornoEffettivo, esercizio.id) : undefined}
                  onDragHandleStart={puoGestire ? (e) => {
                    const clientY = e.touches ? e.touches[0].clientY : e.clientY
                    if (!e.touches) e.preventDefault()
                    dragStartY.current = clientY
                    setDragId(esercizio.id)
                  } : undefined}
                />
              </div>
            )
          }

          return (
            <>
              {eserciziFissi.map(renderEsercizio)}

              {eserciziCondivisi.length > 0 && (
                <>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1 h-px bg-gray-800" />
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                      <Layers2 size={12} />
                      <span>Comuni a tutte le sessioni</span>
                    </div>
                    <div className="flex-1 h-px bg-gray-800" />
                  </div>
                  {eserciziCondivisi.map(renderEsercizio)}</>

              )}
            </>
          )
        })()}

        {/* Aggiungi esercizio */}
        {!activeSession && (
          <button
            onClick={() => setShowPicker(true)}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-700 hover:border-blue-600 text-gray-400 hover:text-blue-400 rounded-2xl py-4 text-sm font-medium transition-colors active:scale-98"
          >
            <Plus size={18} />
            Aggiungi esercizio
          </button>
        )}

        {/* Pulsante Completa + Annulla */}
        {activeSession && (
          <div className="pt-2 pb-4 space-y-2">
            {confermaIncompleto && (
              <div className="flex items-start gap-2 bg-amber-950 border border-amber-800 rounded-xl p-3">
                <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300">
                  Hai completato solo il {percentuale}% delle serie. Vuoi concludere comunque?
                </p>
              </div>
            )}
            <button
              onClick={handleComplezione}
              className={`w-full flex items-center justify-center gap-3 font-semibold rounded-2xl py-4 transition-all active:scale-98 ${
                percentuale >= 100
                  ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-950'
                  : confermaIncompleto
                  ? 'bg-amber-700 hover:bg-amber-600 text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
              }`}
            >
              {percentuale >= 100 ? <Award size={20} /> : <CheckCircle size={20} />}
              {confermaIncompleto ? 'Sì, concludi comunque' : 'Completa Allenamento'}
            </button>

            {/* Annulla sessione */}
            <button
              onClick={() => {
                if (!confermaAnnulla) { setConfermaAnnulla(true); return }
                abbandonaSessione()
              }}
              onBlur={() => setConfermaAnnulla(false)}
              className={`w-full py-3 rounded-2xl text-sm font-medium transition-all active:scale-98 border ${
                confermaAnnulla
                  ? 'bg-red-950 border-red-800 text-red-300'
                  : 'bg-transparent border-gray-800 text-gray-600 hover:text-gray-400'
              }`}
            >
              {confermaAnnulla ? 'Conferma: annulla e scarta i dati' : 'Annulla allenamento'}
            </button>
          </div>
        )}
      </div>

      {/* ExercisePicker */}
      {showPicker && (
        <ExercisePicker
          onSelect={handlePickerSelect}
          onClose={() => setShowPicker(false)}
          onCreaPersonalizzato={() => setModalEsercizio(undefined)}
        />
      )}

      {/* Modal aggiungi/modifica esercizio */}
      {modalEsercizio !== null && (
        <EditExerciseModal
          esercizio={modalEsercizio || null}
          onSave={handleSalvaEsercizio}
          onClose={() => setModalEsercizio(null)}
        />
      )}

      {/* Schermata completamento */}
      {showCompletionModal && activeSession && (
        <CompletionModal
          sessione={activeSession}
          workoutData={workoutData}
          sessioniCompletate={sessioniCompletate}
          streak={streak}
          onConferma={handleConfermaCompletamento}
        />
      )}
    </div>
  )
}
