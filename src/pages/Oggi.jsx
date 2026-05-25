import { useState } from 'react'
import { Play, CheckCircle, Award, AlertTriangle, Pencil, Trash2, Plus, RotateCcw, Settings } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ExerciseCard from '../components/ExerciseCard'
import Timer from '../components/Timer'
import EditExerciseModal from '../components/EditExerciseModal'
import SettingsSheet from '../components/SettingsSheet'
import { ORDINE_GIORNI } from '../data/workout'

const COLORI = {
  A: {
    gradient: 'from-blue-900/30 to-gray-950',
    badge: 'bg-blue-950 text-blue-300 border border-blue-800',
    pill: 'bg-blue-600 text-white',
    bar: 'bg-blue-500',
  },
  B: {
    gradient: 'from-purple-900/30 to-gray-950',
    badge: 'bg-purple-950 text-purple-300 border border-purple-800',
    pill: 'bg-purple-600 text-white',
    bar: 'bg-purple-500',
  },
  C: {
    gradient: 'from-green-900/30 to-gray-950',
    badge: 'bg-green-950 text-green-300 border border-green-800',
    pill: 'bg-green-600 text-white',
    bar: 'bg-green-500',
  },
}

export default function Oggi() {
  const {
    giornoOggi,
    workoutData,
    activeSession,
    iniziaSessione,
    aggiornaEsercizio,
    completaSessione,
    settings,
    setSettings,
    aggiungiEsercizio,
    modificaEsercizio,
    rimuoviEsercizio,
    resetWorkout,
  } = useApp()

  const [giornoOverride, setGiornoOverride] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [confermaIncompleto, setConfermaIncompleto] = useState(false)
  const [confermaReset, setConfermaReset] = useState(false)
  const [modalEsercizio, setModalEsercizio] = useState(null)

  // Giorno effettivo: override manuale ha priorità su quello calcolato
  const giornoEffettivo = giornoOverride ?? giornoOggi
  const giorno = workoutData[giornoEffettivo]
  const colori = COLORI[giornoEffettivo]

  // Giorni disponibili in base alla configurazione
  const giorniAttivi = ORDINE_GIORNI.slice(0, settings.giorniSettimana || 3)

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
    setGiornoOverride(null) // dopo l'avvio l'override non serve più
  }

  function handleComplezione() {
    if (percentuale < 50 && !confermaIncompleto) {
      setConfermaIncompleto(true)
      return
    }
    completaSessione()
    setConfermaIncompleto(false)
    setGiornoOverride(null)
  }

  function handleSalvaEsercizio(dati) {
    if (modalEsercizio?.id) {
      modificaEsercizio(giornoEffettivo, modalEsercizio.id, dati)
    } else {
      aggiungiEsercizio(giornoEffettivo, dati)
    }
    setModalEsercizio(null)
  }

  function handleReset() {
    if (!confermaReset) { setConfermaReset(true); return }
    resetWorkout()
    setConfermaReset(false)
    setEditMode(false)
  }

  function togglePill(id) {
    // Toccare il giorno già attivo deseleziona l'override
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
            {/* Impostazioni */}
            {!activeSession && (
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 bg-gray-800 text-gray-400 hover:bg-gray-700 rounded-xl transition-colors"
                title="Impostazioni"
              >
                <Settings size={15} />
              </button>
            )}
            {/* Modifica scheda */}
            <button
              onClick={() => { setEditMode(!editMode); setConfermaReset(false) }}
              disabled={!!activeSession}
              className={`p-2 rounded-xl transition-colors ${
                editMode
                  ? 'bg-blue-800 text-blue-200'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              } disabled:opacity-30 disabled:cursor-not-allowed`}
              title={activeSession ? 'Termina la sessione per modificare' : 'Modifica scheda'}
            >
              <Pencil size={15} />
            </button>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white leading-tight">{giorno.focus}</h1>
        <p className="text-sm text-gray-400 mt-1">
          {giorno.esercizi.length} esercizi · {totSerie} serie totali
        </p>

        {/* Selettore giorno manuale — visibile solo senza sessione attiva */}
        {!activeSession && (
          <div className="mt-4">
            <div className="flex gap-2">
              {giorniAttivi.map((id) => {
                const attivo = id === giornoEffettivo
                return (
                  <button
                    key={id}
                    onClick={() => togglePill(id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border transition-all active:scale-95 ${
                      attivo
                        ? colori.pill + ' border-transparent shadow-md'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {id}
                    <span className={`text-xs font-normal ${attivo ? 'opacity-80' : 'opacity-50'}`}>
                      {workoutData[id].focus.split(' · ')[0]}
                    </span>
                  </button>
                )
              })}
            </div>
            {/* Indica se il giorno è stato scelto manualmente */}
            {giornoOverride && giornoOverride !== giornoOggi && (
              <p className="text-xs text-gray-500 mt-2">
                Rotazione automatica:{' '}
                <button
                  onClick={() => setGiornoOverride(null)}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  torna al Giorno {giornoOggi}
                </button>
              </p>
            )}
          </div>
        )}

        {/* Barra avanzamento sessione */}
        {activeSession && (
          <div className="mt-4 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${colori.bar} rounded-full transition-all duration-500`}
              style={{ width: `${percentuale}%` }}
            />
          </div>
        )}
      </div>

      <div className="px-4 mt-4 space-y-3">
        {/* Pulsante Inizia o Timer */}
        {!activeSession && !editMode && (
          <button
            onClick={handleIniziaSessione}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-semibold rounded-2xl py-4 transition-all shadow-lg shadow-blue-950"
          >
            <Play size={20} fill="white" />
            Inizia Allenamento
          </button>
        )}

        {activeSession && <Timer defaultDuration={settings.timerDuration} />}

        {/* Banner modalità modifica */}
        {editMode && (
          <div className="bg-blue-950 border border-blue-800 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
            <p className="text-xs text-blue-300">
              Tocca ✏️ per modificare o 🗑 per rimuovere un esercizio.
            </p>
            <button
              onClick={handleReset}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl flex-shrink-0 transition-colors ${
                confermaReset
                  ? 'bg-red-800 text-red-200'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <RotateCcw size={12} />
              {confermaReset ? 'Conferma reset' : 'Reset default'}
            </button>
          </div>
        )}

        {/* Lista esercizi */}
        {giorno.esercizi.map((esercizio) =>
          editMode ? (
            <div key={esercizio.id} className="relative">
              <ExerciseCard esercizio={esercizio} datiSerie={[]} onAggiornaSerie={undefined} />
              <div className="absolute top-3 right-10 flex gap-1">
                <button
                  onClick={() => setModalEsercizio(esercizio)}
                  className="p-2 bg-gray-800 hover:bg-gray-700 active:scale-90 rounded-xl transition-all border border-gray-700"
                >
                  <Pencil size={13} className="text-blue-400" />
                </button>
                <button
                  onClick={() => rimuoviEsercizio(giornoEffettivo, esercizio.id)}
                  className="p-2 bg-gray-800 hover:bg-red-900 active:scale-90 rounded-xl transition-all border border-gray-700"
                >
                  <Trash2 size={13} className="text-red-400" />
                </button>
              </div>
            </div>
          ) : (
            <ExerciseCard
              key={esercizio.id}
              esercizio={esercizio}
              datiSerie={activeSession?.exercises[esercizio.id]?.sets || []}
              onAggiornaSerie={
                activeSession
                  ? (sets) => aggiornaEsercizio(esercizio.id, { sets })
                  : undefined
              }
            />
          )
        )}

        {/* Aggiungi esercizio in edit mode */}
        {editMode && (
          <button
            onClick={() => setModalEsercizio(undefined)}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-700 hover:border-blue-600 text-gray-400 hover:text-blue-400 rounded-2xl py-4 text-sm font-medium transition-colors active:scale-98"
          >
            <Plus size={18} />
            Aggiungi esercizio
          </button>
        )}

        {/* Pulsante Completa */}
        {activeSession && (
          <div className="pt-2 pb-4">
            {confermaIncompleto && (
              <div className="flex items-start gap-2 bg-amber-950 border border-amber-800 rounded-xl p-3 mb-3">
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
          </div>
        )}
      </div>

      {/* Modal aggiungi/modifica esercizio */}
      {modalEsercizio !== null && (
        <EditExerciseModal
          esercizio={modalEsercizio || null}
          onSave={handleSalvaEsercizio}
          onClose={() => setModalEsercizio(null)}
        />
      )}

      {/* Pannello impostazioni */}
      {showSettings && (
        <SettingsSheet
          settings={settings}
          onUpdateSettings={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
