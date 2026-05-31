import { useState } from 'react'
import { ChevronDown, ChevronUp, Info } from 'lucide-react'

export default function ExerciseCard({ esercizio, datiSerie = [], onAggiornaSerie, defaultExpanded = false, rightSlot, onCardClick }) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const { nome, serie, reps, note, gruppo, isBodyweight, isTime } = esercizio

  // Normalizza le serie con i dati salvati
  const seriePiano = Array.from({ length: serie }, (_, i) => ({
    done: datiSerie[i]?.done || false,
    weight: datiSerie[i]?.weight || '',
  }))

  const serieCompletate = seriePiano.filter((s) => s.done).length
  const tutteCompletate = serieCompletate === serie
  const attiva = !!onAggiornaSerie

  function toggleSerie(idx) {
    if (!attiva) return
    const aggiornate = seriePiano.map((s, i) =>
      i === idx ? { ...s, done: !s.done } : s
    )
    onAggiornaSerie(aggiornate)
  }

  function setPeso(idx, weight) {
    if (!attiva) return
    const aggiornate = seriePiano.map((s, i) =>
      i === idx ? { ...s, weight } : s
    )
    onAggiornaSerie(aggiornate)
  }

  return (
    <div
      className={`rounded-2xl border transition-colors ${
        tutteCompletate && attiva
          ? 'bg-green-950 border-green-800'
          : 'bg-gray-900 border-gray-800'
      }`}
    >
      {/* Intestazione card */}
      <div className="flex items-stretch">
        <button
          onClick={onCardClick ? onCardClick : () => setExpanded(!expanded)}
          className="flex-1 flex items-center gap-3 p-4 pr-2 text-left min-w-0"
        >
          {/* Indicatore progresso */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
              tutteCompletate && attiva
                ? 'bg-green-600 text-white'
                : serieCompletate > 0
                ? 'bg-blue-900 text-blue-300 border border-blue-700'
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            {tutteCompletate && attiva ? '✓' : `${serieCompletate}/${serie}`}
          </div>

          <div className="flex-1 min-w-0">
            <p
              className={`font-semibold text-sm leading-tight truncate ${
                tutteCompletate && attiva ? 'text-green-300' : 'text-white'
              }`}
            >
              {nome}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {serie} serie × {reps}
              <span className="mx-1">·</span>
              {gruppo}
            </p>
          </div>

          {!onCardClick && (expanded ? (
            <ChevronUp size={16} className="text-gray-500 flex-shrink-0" />
          ) : (
            <ChevronDown size={16} className="text-gray-500 flex-shrink-0" />
          ))}
        </button>
        {rightSlot}
      </div>

      {/* Dettaglio espanso */}
      {expanded && (
        <div className="px-4 pb-4 space-y-2.5">
          {/* Nota tecnica */}
          {note && (
            <div className="flex gap-2 bg-gray-800 rounded-xl p-3">
              <Info size={13} className="text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-300 leading-relaxed">{note}</p>
            </div>
          )}

          {/* Riga per ogni serie */}
          {seriePiano.map((s, idx) => (
            <div key={idx} className="flex items-center gap-2.5">
              {/* Checkbox serie */}
              <button
                onClick={() => toggleSerie(idx)}
                disabled={!attiva}
                className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  attiva ? 'active:scale-90' : 'opacity-50 cursor-default'
                } ${
                  s.done
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'border-gray-600 text-transparent'
                }`}
              >
                ✓
              </button>

              <span className="text-xs text-gray-500 w-14 flex-shrink-0">
                Serie {idx + 1}
              </span>

              <span className="text-xs text-gray-500 w-16 flex-shrink-0">
                {isTime ? reps : `${reps} reps`}
              </span>

              {/* Input peso (non per esercizi isometrici come plank) */}
              {!isBodyweight && (
                <div className="flex items-center gap-1 flex-1">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={s.weight}
                    onChange={(e) => setPeso(idx, e.target.value.replace(',', '.'))}
                    placeholder="—"
                    disabled={!attiva}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  />
                  <span className="text-xs text-gray-500 flex-shrink-0">kg</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
