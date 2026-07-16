import { useState } from 'react'
import { X, Pencil, Trash2, ChevronUp, ChevronDown, Plus } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { COLORI_SESSIONE } from '../data/workout'
import SessionEditModal from './SessionEditModal'

export default function SessioniManagerSheet({ onClose }) {
  const {
    schedaAttiva,
    riordinaSessioni,
    eliminaSessione,
    aggiungiSessione,
    rinominaSessione,
  } = useApp()

  const [confermaEliminaId, setConfermaEliminaId] = useState(null)
  const [modalTarget, setModalTarget] = useState(null) // null=chiuso, undefined=nuova, obj=modifica

  const sessioni = schedaAttiva?.sessioni || []

  function spostaSessione(idx, direction) {
    const arr = [...sessioni]
    const targetIdx = idx + direction
    if (targetIdx < 0 || targetIdx >= arr.length) return
    ;[arr[idx], arr[targetIdx]] = [arr[targetIdx], arr[idx]]
    riordinaSessioni(schedaAttiva.id, arr)
  }

  function handleElimina(id) {
    if (confermaEliminaId === id) {
      eliminaSessione(schedaAttiva.id, id)
      setConfermaEliminaId(null)
    } else {
      setConfermaEliminaId(id)
    }
  }

  function handleSalva(dati) {
    if (modalTarget) {
      rinominaSessione(schedaAttiva.id, modalTarget.id, dati)
    } else {
      aggiungiSessione(schedaAttiva.id, dati)
    }
    setModalTarget(null)
  }

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 flex items-end"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full bg-gray-900 border-t border-gray-800 rounded-t-3xl p-5 pb-10 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 flex-shrink-0">
          <h2 className="text-lg font-bold text-white">Gestisci sessioni</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Lista sessioni */}
        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          {sessioni.map((sess, idx) => {
            const isConfermaElimina = confermaEliminaId === sess.id
            const sessColori = (sess.colore && COLORI_SESSIONE[sess.colore]) || COLORI_SESSIONE.blue

            return (
              <div
                key={sess.id}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl border bg-gray-800 border-gray-700"
              >
                <span className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${sessColori.dot}`} />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {sess.emoji} {sess.nome}
                  </p>
                </div>

                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button
                    onClick={() => spostaSessione(idx, -1)}
                    disabled={idx === 0}
                    className="p-1.5 text-gray-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    <ChevronUp size={15} />
                  </button>
                  <button
                    onClick={() => spostaSessione(idx, 1)}
                    disabled={idx === sessioni.length - 1}
                    className="p-1.5 text-gray-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    <ChevronDown size={15} />
                  </button>
                  <button
                    onClick={() => setModalTarget(sess)}
                    className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Pencil size={13} className="text-gray-300" />
                  </button>
                  <button
                    onClick={() => handleElimina(sess.id)}
                    disabled={sessioni.length <= 1}
                    className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                      isConfermaElimina ? 'bg-red-700 hover:bg-red-600' : 'bg-gray-700 hover:bg-red-900'
                    }`}
                    title={isConfermaElimina ? 'Tocca ancora per confermare' : 'Elimina sessione'}
                  >
                    <Trash2 size={13} className={isConfermaElimina ? 'text-red-200' : 'text-red-400'} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Nuova sessione */}
        <div className="pt-4 flex-shrink-0">
          <button
            onClick={() => setModalTarget(undefined)}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-700 hover:border-blue-600 text-gray-400 hover:text-blue-400 rounded-2xl py-3.5 text-sm font-medium transition-colors active:scale-98"
          >
            <Plus size={16} />
            Nuova sessione
          </button>
        </div>
      </div>

      {modalTarget !== null && (
        <SessionEditModal
          sessione={modalTarget || null}
          onSave={handleSalva}
          onClose={() => setModalTarget(null)}
        />
      )}
    </div>
  )
}
