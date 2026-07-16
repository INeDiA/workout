import { useState, useEffect, useRef } from 'react'
import { ChevronDown, ChevronUp, Info, Pencil, Trash2, GripVertical } from 'lucide-react'

const REVEAL_WIDTH = 132

export default function ExerciseCard({
  esercizio, datiSerie = [], onAggiornaSerie, defaultExpanded = false, onSaveMemo,
  open = false, onOpenChange, onEdit, onDelete, onDragHandleStart,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [memoValue, setMemoValue] = useState(esercizio.memo || '')
  const [confermaElimina, setConfermaElimina] = useState(false)
  const { nome, serie, reps, note, gruppo, isBodyweight, isTime } = esercizio

  const canManage = !!(onEdit || onDelete || onDragHandleStart)

  // Reset della conferma quando la card si richiude (swipe indietro, o apertura di un'altra card)
  useEffect(() => {
    if (!open) setConfermaElimina(false)
  }, [open])

  // ── Swipe-to-reveal (solo se canManage) ──────────────────────────────
  // offsetRef è la fonte di verità letta/scritta sincronamente dai gesture handler;
  // offset (state) esiste solo per innescare il re-render visivo del transform.
  const [offset, setOffset] = useState(0)
  const offsetRef = useRef(0)
  const draggingRef = useRef(false)
  const startX = useRef(0)
  const startY = useRef(0)
  const startOffset = useRef(0)
  const axisLock = useRef(null)

  function updateOffset(v) {
    offsetRef.current = v
    setOffset(v)
  }

  useEffect(() => {
    if (!draggingRef.current) updateOffset(open ? -REVEAL_WIDTH : 0)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  function gestureStart(x, y) {
    if (!canManage) return
    draggingRef.current = true
    startX.current = x
    startY.current = y
    startOffset.current = offsetRef.current
    axisLock.current = null
  }

  function gestureMove(x, y) {
    if (!draggingRef.current) return
    const dx = x - startX.current
    const dy = y - startY.current
    if (!axisLock.current) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return
      axisLock.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
      if (axisLock.current === 'y') { draggingRef.current = false; return }
    }
    const next = Math.min(0, Math.max(-REVEAL_WIDTH, startOffset.current + dx))
    updateOffset(next)
  }

  function gestureEnd() {
    if (!draggingRef.current) return
    draggingRef.current = false
    const shouldOpen = offsetRef.current < -REVEAL_WIDTH / 2
    updateOffset(shouldOpen ? -REVEAL_WIDTH : 0)
    if (shouldOpen !== open) onOpenChange?.(shouldOpen)
  }

  useEffect(() => {
    if (!canManage) return
    const onMouseMove = (e) => gestureMove(e.clientX, e.clientY)
    const onMouseUp = () => gestureEnd()
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [canManage, open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Normalizza le serie con i dati salvati
  const seriePiano = Array.from({ length: serie }, (_, i) => ({
    done: datiSerie[i]?.done || false,
    weight: datiSerie[i]?.weight || '',
  }))

  const serieCompletate = seriePiano.filter((s) => s.done).length
  const tutteCompletate = serieCompletate === serie
  const attiva = !!onAggiornaSerie

  // Auto-collasso dopo 800ms quando tutte le serie sono completate (solo in sessione attiva)
  useEffect(() => {
    if (tutteCompletate && attiva && expanded) {
      const t = setTimeout(() => setExpanded(false), 800)
      return () => clearTimeout(t)
    }
  }, [tutteCompletate]) // eslint-disable-line react-hooks/exhaustive-deps

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

  function handleHeaderClick() {
    if (offset < 0) { onOpenChange?.(false); return }
    setExpanded(!expanded)
  }

  return (
    <div className="relative rounded-2xl overflow-hidden" style={canManage ? { touchAction: 'pan-y' } : undefined}>
      {/* Pannello azioni rivelato dallo swipe */}
      {canManage && (
        <div className="absolute inset-y-0 right-0 flex items-stretch" style={{ width: REVEAL_WIDTH }}>
          {onEdit && (
            <button
              onClick={() => { onOpenChange?.(false); onEdit() }}
              className="flex-1 flex items-center justify-center bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              <Pencil size={16} className="text-gray-200" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => {
                if (!confermaElimina) { setConfermaElimina(true); return }
                onOpenChange?.(false)
                onDelete()
              }}
              className={`flex-1 flex items-center justify-center transition-colors ${
                confermaElimina ? 'bg-red-600' : 'bg-red-900 hover:bg-red-800'
              }`}
            >
              <Trash2 size={16} className={confermaElimina ? 'text-white' : 'text-red-300'} />
            </button>
          )}
          {onDragHandleStart && (
            <div
              className="flex-1 flex items-center justify-center bg-gray-800 touch-none select-none cursor-grab active:cursor-grabbing"
              onMouseDown={onDragHandleStart}
              onTouchStart={(e) => { e.stopPropagation(); onDragHandleStart(e) }}
            >
              <GripVertical size={16} className="text-gray-400" />
            </div>
          )}
        </div>
      )}

      {/* Card in primo piano */}
      <div
        className={`relative rounded-2xl border ${
          tutteCompletate && attiva
            ? 'bg-green-950 border-green-800'
            : 'bg-gray-900 border-gray-800'
        }`}
        style={{
          transform: `translateX(${offset}px)`,
          transition: draggingRef.current ? 'none' : 'transform 0.2s ease-out',
        }}
        onTouchStart={canManage ? (e) => gestureStart(e.touches[0].clientX, e.touches[0].clientY) : undefined}
        onTouchMove={canManage ? (e) => gestureMove(e.touches[0].clientX, e.touches[0].clientY) : undefined}
        onTouchEnd={canManage ? gestureEnd : undefined}
        onMouseDown={canManage ? (e) => gestureStart(e.clientX, e.clientY) : undefined}
      >
        {/* Intestazione card */}
        <div className="flex items-stretch">
          <button
            onClick={handleHeaderClick}
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

            {expanded ? (
              <ChevronUp size={16} className="text-gray-500 flex-shrink-0" />
            ) : (
              <ChevronDown size={16} className="text-gray-500 flex-shrink-0" />
            )}
          </button>
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

            {/* Memo personale — inline edit, auto-save on blur */}
            {onSaveMemo && (
              <textarea
                value={memoValue}
                onChange={(e) => setMemoValue(e.target.value)}
                onBlur={() => onSaveMemo(memoValue.trim())}
                placeholder="Appunti…"
                rows={2}
                maxLength={200}
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-3 py-2 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-600 resize-none"
              />
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
    </div>
  )
}
