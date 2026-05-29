import { useState, useEffect } from 'react'
import { X, Layers2 } from 'lucide-react'

const GRUPPI_MUSCOLARI = [
  'Petto',
  'Schiena',
  'Spalle',
  'Bicipiti',
  'Tricipiti',
  'Quadricipiti',
  'Femorali',
  'Glutei',
  'Core',
  'Polpacci',
  'Altro',
]

const FORM_VUOTO = {
  nome: '',
  gruppo: '',
  serie: 3,
  reps: '10-12',
  note: '',
  isBodyweight: false,
  isTime: false,
  isShared: false,
}

export default function EditExerciseModal({ esercizio, onSave, onClose }) {
  const [form, setForm] = useState(FORM_VUOTO)

  // Precompila il form se stiamo modificando un esercizio esistente
  useEffect(() => {
    if (esercizio) {
      setForm({
        nome: esercizio.nome || '',
        gruppo: esercizio.gruppo || '',
        serie: esercizio.serie || 3,
        reps: esercizio.reps || '10-12',
        note: esercizio.note || '',
        isBodyweight: esercizio.isBodyweight || false,
        isTime: esercizio.isTime || false,
        isShared: esercizio.isShared || false,
      })
    } else {
      setForm(FORM_VUOTO)
    }
  }, [esercizio])

  function set(campo, valore) {
    setForm((prev) => ({ ...prev, [campo]: valore }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.nome.trim()) return
    onSave({ ...form, serie: parseInt(form.serie) || 3 })
  }

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 flex items-end"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full bg-gray-900 border-t border-gray-800 rounded-t-3xl p-5 pb-safe max-h-[92dvh] overflow-y-auto">
        {/* Intestazione */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">
            {esercizio ? 'Modifica esercizio' : 'Nuovo esercizio'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block font-medium">
              Nome esercizio *
            </label>
            <input
              autoFocus
              type="text"
              value={form.nome}
              onChange={(e) => set('nome', e.target.value)}
              placeholder="es. Panca piana manubri"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Gruppo muscolare */}
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block font-medium">
              Gruppo muscolare
            </label>
            <select
              value={form.gruppo}
              onChange={(e) => set('gruppo', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">— Seleziona —</option>
              {GRUPPI_MUSCOLARI.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Serie + Ripetizioni */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block font-medium">Serie</label>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                max="20"
                value={form.serie}
                onChange={(e) => set('serie', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block font-medium">
                Reps / Durata
              </label>
              <input
                type="text"
                value={form.reps}
                onChange={(e) => set('reps', e.target.value)}
                placeholder="es. 8-10  |  45 sec"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Toggle tipo esercizio */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => set('isBodyweight', !form.isBodyweight)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-colors ${
                form.isBodyweight
                  ? 'bg-blue-950 border-blue-700 text-blue-300'
                  : 'bg-gray-800 border-gray-700 text-gray-400'
              }`}
            >
              Peso corporeo
            </button>
            <button
              type="button"
              onClick={() => set('isTime', !form.isTime)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-colors ${
                form.isTime
                  ? 'bg-blue-950 border-blue-700 text-blue-300'
                  : 'bg-gray-800 border-gray-700 text-gray-400'
              }`}
            >
              A tempo
            </button>
          </div>

          {/* Toggle esercizio ricorrente */}
          <button
            type="button"
            onClick={() => set('isShared', !form.isShared)}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-medium border transition-colors ${
              form.isShared
                ? 'bg-blue-950 border-blue-700 text-blue-300'
                : 'bg-gray-800 border-gray-700 text-gray-400'
            }`}
          >
            <Layers2 size={13} />
            Comune a tutte le sessioni
          </button>

          {/* Note tecniche */}
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block font-medium">
              Note tecniche
            </label>
            <textarea
              value={form.note}
              onChange={(e) => set('note', e.target.value)}
              placeholder="Indicazioni sulla tecnica esecutiva…"
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Pulsante salva */}
          <button
            type="submit"
            disabled={!form.nome.trim()}
            className="w-full bg-blue-600 hover:bg-blue-500 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-2xl py-4 transition-all"
          >
            {esercizio ? 'Salva modifiche' : 'Aggiungi esercizio'}
          </button>
        </form>
      </div>
    </div>
  )
}
