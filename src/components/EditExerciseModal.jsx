import { useState } from 'react'
import { X, Layers2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { GRUPPI_MUSCOLARI } from '../data/exerciseDatabase'
import { GRUPPO_LABELS } from '../data/workout'

const FORM_VUOTO = {
  nome: '',
  gruppo: '',
  serie: 3,
  reps: '10-12',
  note: '',
  isBodyweight: false,
  isTime: false,
  isShared: false,
  isInverted: false,
}

export default function EditExerciseModal({ esercizio, onSave, onClose }) {
  const { t, lingua } = useApp()
  // Il modal viene montato ex-novo ad ogni apertura (vedi {modalEsercizio !== null && ...}
  // in Oggi.jsx), quindi basta un inizializzatore lazy per precompilare il form
  const [form, setForm] = useState(() =>
    esercizio
      ? {
          nome: esercizio.nome || '',
          gruppo: esercizio.gruppo || '',
          serie: esercizio.serie || 3,
          reps: esercizio.reps || '10-12',
          note: esercizio.note || '',
          isBodyweight: esercizio.isBodyweight || false,
          isTime: esercizio.isTime || false,
          isShared: esercizio.isShared || false,
          isInverted: esercizio.isInverted || false,
        }
      : FORM_VUOTO
  )

  const gruppiMuscolari = [...GRUPPI_MUSCOLARI.map((g) => GRUPPO_LABELS[g]?.[lingua] ?? g), t.editExerciseModal.altro]

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
            {esercizio ? t.editExerciseModal.modificaEsercizio : t.editExerciseModal.nuovoEsercizio}
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
              {t.editExerciseModal.nomeEsercizio}
            </label>
            <input
              autoFocus
              type="text"
              value={form.nome}
              onChange={(e) => set('nome', e.target.value)}
              placeholder={t.editExerciseModal.placeholderNome}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Gruppo muscolare */}
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block font-medium">
              {t.editExerciseModal.gruppoMuscolare}
            </label>
            <select
              value={form.gruppo}
              onChange={(e) => set('gruppo', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">{t.editExerciseModal.selezionaGruppo}</option>
              {gruppiMuscolari.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Serie + Ripetizioni */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block font-medium">{t.editExerciseModal.serie}</label>
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
                {t.editExerciseModal.repsDurata}
              </label>
              <input
                type="text"
                value={form.reps}
                onChange={(e) => set('reps', e.target.value)}
                placeholder={t.editExerciseModal.placeholderReps}
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
              {t.editExerciseModal.pesoCorporeo}
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
              {t.editExerciseModal.aTempo}
            </button>
            <button
              type="button"
              onClick={() => set('isInverted', !form.isInverted)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-colors ${
                form.isInverted
                  ? 'bg-blue-950 border-blue-700 text-blue-300'
                  : 'bg-gray-800 border-gray-700 text-gray-400'
              }`}
            >
              {t.editExerciseModal.assistenza}
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
            {t.editExerciseModal.comuneATutte}
          </button>

          {/* Note tecniche */}
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block font-medium">
              {t.editExerciseModal.noteTecniche}
            </label>
            <textarea
              value={form.note}
              onChange={(e) => set('note', e.target.value)}
              placeholder={t.editExerciseModal.placeholderNote}
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
            {esercizio ? t.editExerciseModal.salvaModifiche : t.editExerciseModal.aggiungiEsercizio}
          </button>
        </form>
      </div>
    </div>
  )
}
