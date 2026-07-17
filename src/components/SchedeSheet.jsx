import { useState } from 'react'
import { X, Pencil, Trash2, Copy, Check, Plus } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function SchedeSheet({ onClose }) {
  const {
    t,
    schede,
    schedaAttiva,
    setSchedaAttiva,
    creaScheda,
    creaSchedaStandard,
    rinominaScheda,
    eliminaScheda,
    duplicaScheda,
  } = useApp()

  const [rinominaId, setRinominaId] = useState(null)
  const [rinominaNome, setRinominaNome] = useState('')
  const [confermaEliminaId, setConfermaEliminaId] = useState(null)

  function handleRinominaInizio(scheda) {
    setRinominaId(scheda.id)
    setRinominaNome(scheda.nome)
  }

  function handleRinominaConferma(id) {
    if (rinominaNome.trim()) {
      rinominaScheda(id, rinominaNome.trim())
    }
    setRinominaId(null)
  }

  function handleElimina(id) {
    if (confermaEliminaId === id) {
      eliminaScheda(id)
      setConfermaEliminaId(null)
    } else {
      setConfermaEliminaId(id)
    }
  }

  function handleCrea() {
    const n = (schede?.length || 0) + 1
    const nuova = creaScheda(`${t.schedeSheet.nuovaScheda} ${n}`)
    setSchedaAttiva(nuova.id)
  }

  function handleCreaStandard() {
    const nuova = creaSchedaStandard()
    setSchedaAttiva(nuova.id)
  }

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 flex items-end"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setRinominaId(null)
          setConfermaEliminaId(null)
          onClose()
        }
      }}
    >
      <div className="w-full bg-gray-900 border-t border-gray-800 rounded-t-3xl p-5 pb-10 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 flex-shrink-0">
          <h2 className="text-lg font-bold text-white">{t.schedeSheet.titolo}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Lista schede */}
        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          {(schede || []).map((scheda) => {
            const isAttiva = scheda.id === schedaAttiva?.id
            const isRinomina = rinominaId === scheda.id
            const isConfermaElimina = confermaEliminaId === scheda.id

            return (
              <div
                key={scheda.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-colors ${
                  isAttiva
                    ? 'bg-blue-950 border-blue-800'
                    : 'bg-gray-800 border-gray-700'
                }`}
              >
                {/* Radio / check attiva */}
                <button
                  onClick={() => {
                    setSchedaAttiva(scheda.id)
                    setConfermaEliminaId(null)
                  }}
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                    isAttiva
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-600 hover:border-blue-400'
                  }`}
                >
                  {isAttiva && <div className="w-2 h-2 rounded-full bg-white" />}
                </button>

                {/* Nome (inline edit) */}
                <div className="flex-1 min-w-0" onClick={() => !isRinomina && setSchedaAttiva(scheda.id)}>
                  {isRinomina ? (
                    <input
                      autoFocus
                      value={rinominaNome}
                      onChange={(e) => setRinominaNome(e.target.value)}
                      onBlur={() => handleRinominaConferma(scheda.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRinominaConferma(scheda.id)
                        if (e.key === 'Escape') setRinominaId(null)
                      }}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <p className={`text-sm font-semibold truncate ${isAttiva ? 'text-blue-200' : 'text-white'}`}>
                        {scheda.nome}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {scheda.sessioni?.length || 0} {t.schedeSheet.sessioni}
                      </p>
                    </>
                  )}
                </div>

                {/* Azioni */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {isRinomina ? (
                    <button
                      onClick={() => handleRinominaConferma(scheda.id)}
                      className="p-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                    >
                      <Check size={13} className="text-white" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRinominaInizio(scheda) }}
                      className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <Pencil size={13} className="text-gray-300" />
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); duplicaScheda(scheda.id) }}
                    className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Copy size={13} className="text-gray-300" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleElimina(scheda.id) }}
                    disabled={(schede?.length || 1) <= 1}
                    className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                      isConfermaElimina
                        ? 'bg-red-700 hover:bg-red-600'
                        : 'bg-gray-700 hover:bg-red-900'
                    }`}
                    title={isConfermaElimina ? t.schedeSheet.toccaAncoraConferma : t.schedeSheet.eliminaScheda}
                  >
                    <Trash2 size={13} className={isConfermaElimina ? 'text-red-200' : 'text-red-400'} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Nuova scheda */}
        <div className="pt-4 flex-shrink-0 grid grid-cols-2 gap-2">
          <button
            onClick={handleCrea}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-700 hover:border-blue-600 text-gray-400 hover:text-blue-400 rounded-2xl py-3.5 text-sm font-medium transition-colors active:scale-98"
          >
            <Plus size={16} />
            {t.schedeSheet.nuovaScheda}
          </button>
          <button
            onClick={handleCreaStandard}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-700 hover:border-blue-600 text-gray-400 hover:text-blue-400 rounded-2xl py-3.5 text-sm font-medium transition-colors active:scale-98"
          >
            <Plus size={16} />
            {t.schedeSheet.schedaStandard}
          </button>
        </div>
      </div>
    </div>
  )
}
