import { useState } from 'react'
import { X, Save, Trash2 } from 'lucide-react'
import ExerciseCard from './ExerciseCard'
import { useApp } from '../context/AppContext'

export default function SessionePassataModal({ sessione, onClose, onElimina }) {
  const { workoutData, modificaSessionePassata } = useApp()

  // Copia locale modificabile dei dati registrati
  const [exercisesEdit, setExercisesEdit] = useState(() =>
    JSON.parse(JSON.stringify(sessione.exercises || {}))
  )
  const [dirty, setDirty] = useState(false)
  const [salvato, setSalvato] = useState(false)
  const [confermaElimina, setConfermaElimina] = useState(false)

  const giorno = workoutData[sessione.dayId]

  // Data leggibile — evita sfasamenti UTC
  const [anno, mese, giornoDt] = sessione.date.split('-').map(Number)
  const dataStr = new Date(anno, mese - 1, giornoDt).toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  function handleAggiornaSerie(exerciseId, sets) {
    setExercisesEdit((prev) => ({
      ...prev,
      [exerciseId]: { ...(prev[exerciseId] || {}), sets },
    }))
    setDirty(true)
    setSalvato(false)
  }

  function handleSalva() {
    modificaSessionePassata(sessione.id, exercisesEdit)
    setDirty(false)
    setSalvato(true)
  }

  // Conta serie completate per l'intestazione
  const totSerie = (giorno?.esercizi || []).reduce((sum, e) => sum + e.serie, 0)
  const serieCompletate = Object.values(exercisesEdit).reduce(
    (sum, ex) => sum + (ex.sets || []).filter((s) => s.done).length,
    0
  )

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/70 flex items-end"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full bg-gray-900 border-t border-gray-800 rounded-t-3xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white capitalize">{dataStr}</h2>
              {giorno ? (
                <p className="text-sm text-gray-400 mt-0.5">
                  {giorno.emoji} {giorno.nome}
                  <span className="mx-1.5 text-gray-600">·</span>
                  {serieCompletate}/{totSerie} serie
                </p>
              ) : (
                <p className="text-sm text-gray-500 mt-0.5">Sessione non più nella scheda</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors flex-shrink-0"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Lista esercizi */}
        <div className="flex-1 overflow-y-auto px-5 space-y-3 py-3 min-h-0">
          {giorno ? (
            (giorno.esercizi || []).map((esercizio) => (
              <ExerciseCard
                key={esercizio.id}
                esercizio={esercizio}
                datiSerie={exercisesEdit[esercizio.id]?.sets || []}
                onAggiornaSerie={(sets) => handleAggiornaSerie(esercizio.id, sets)}
                defaultExpanded
              />
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-10">
              Gli esercizi di questa sessione non sono più disponibili nella scheda attiva.
            </p>
          )}
        </div>

        {/* Footer salvataggio */}
        <div className="px-5 pt-3 pb-8 border-t border-gray-800 flex-shrink-0 space-y-2">
          <button
            onClick={handleSalva}
            disabled={!dirty}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-98 ${
              salvato
                ? 'bg-green-700 text-green-100 cursor-default'
                : dirty
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}
          >
            <Save size={16} />
            {salvato ? 'Salvato' : 'Salva modifiche'}
          </button>

          {onElimina && (
            <button
              onClick={() => {
                if (!confermaElimina) { setConfermaElimina(true); return }
                onElimina(sessione.id)
              }}
              onBlur={() => setConfermaElimina(false)}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-medium transition-all active:scale-98 border ${
                confermaElimina
                  ? 'bg-red-950 border-red-800 text-red-300'
                  : 'bg-transparent border-gray-800 text-gray-600 hover:text-gray-400'
              }`}
            >
              <Trash2 size={14} />
              {confermaElimina ? 'Conferma eliminazione' : 'Elimina allenamento'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
