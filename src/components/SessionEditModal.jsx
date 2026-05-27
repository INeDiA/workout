import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { COLORI_LISTA, COLORI_SESSIONE } from '../data/workout'

export default function SessionEditModal({ sessione, onSave, onClose }) {
  const [nome, setNome] = useState('')
  const [emoji, setEmoji] = useState('💪')
  const [colore, setColore] = useState('blue')

  useEffect(() => {
    if (sessione) {
      setNome(sessione.nome || sessione.focus || '')
      setEmoji(sessione.emoji || '💪')
      setColore(sessione.colore || 'blue')
    } else {
      setNome('')
      setEmoji('💪')
      setColore('blue')
    }
  }, [sessione])

  function handleSubmit(e) {
    e.preventDefault()
    if (!nome.trim()) return
    onSave({ nome: nome.trim(), emoji, colore })
  }

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/70 flex items-end"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full bg-gray-900 border-t border-gray-800 rounded-t-3xl p-5 pb-safe max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">
            {sessione ? 'Modifica sessione' : 'Nuova sessione'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome sessione */}
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block font-medium">
              Nome sessione *
            </label>
            <input
              autoFocus
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="es. Petto · Tricipiti · Spalle"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Emoji */}
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block font-medium">
              Emoji
            </label>
            <input
              type="text"
              value={emoji}
              onChange={(e) => {
                // Prendi solo il primo carattere/emoji
                const val = e.target.value
                if (val.length === 0) {
                  setEmoji('')
                  return
                }
                // Estrai il primo grapheme cluster (emoji)
                const match = [...val]
                setEmoji(match[match.length - 1] || val[0])
              }}
              placeholder="💪"
              className="w-24 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-2xl text-center focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Selettore colore */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block font-medium">
              Colore
            </label>
            <div className="flex gap-3">
              {COLORI_LISTA.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColore(c)}
                  className={`w-9 h-9 rounded-full transition-all ${COLORI_SESSIONE[c].dot} ${
                    colore === c
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110'
                      : 'opacity-60 hover:opacity-90'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Salva */}
          <button
            type="submit"
            disabled={!nome.trim()}
            className="w-full bg-blue-600 hover:bg-blue-500 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-2xl py-4 transition-all mt-2"
          >
            {sessione ? 'Salva modifiche' : 'Crea sessione'}
          </button>
        </form>
      </div>
    </div>
  )
}
