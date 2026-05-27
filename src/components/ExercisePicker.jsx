import { useState, useMemo } from 'react'
import { X, Plus, Search } from 'lucide-react'
import { ESERCIZI_DATABASE, GRUPPI_MUSCOLARI } from '../data/exerciseDatabase'
import { useLocalStorage } from '../hooks/useStorage'

export function useEserciziCustom() {
  return useLocalStorage('sm_esercizi_custom', [])
}

export default function ExercisePicker({ onSelect, onClose, onCreaPersonalizzato }) {
  const [query, setQuery] = useState('')
  const [gruppoFiltro, setGruppoFiltro] = useState('Tutti')
  const [eserciziCustom] = useEserciziCustom()

  const eserciziFiltrati = useMemo(() => {
    const q = query.toLowerCase().trim()

    const filtra = (lista) =>
      lista.filter((e) => {
        const matchGruppo = gruppoFiltro === 'Tutti' || e.gruppo === gruppoFiltro
        const matchQuery = !q || e.nome.toLowerCase().includes(q) || e.gruppo.toLowerCase().includes(q)
        return matchGruppo && matchQuery
      })

    const custom = filtra(eserciziCustom || [])
    const db = filtra(ESERCIZI_DATABASE)

    return { custom, db }
  }, [query, gruppoFiltro, eserciziCustom])

  function handleSeleziona(esercizio) {
    // Converti i default nel formato esercizio della sessione
    const esercizioSessione = {
      nome: esercizio.nome,
      gruppo: esercizio.gruppo,
      serie: esercizio.defaultSerie ?? esercizio.serie ?? 3,
      reps: esercizio.defaultReps ?? esercizio.reps ?? '10-12',
      note: esercizio.note || '',
      isBodyweight: esercizio.isBodyweight || false,
      isTime: esercizio.isTime || false,
    }
    onSelect(esercizioSessione)
  }

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 flex items-end"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full bg-gray-900 border-t border-gray-800 rounded-t-3xl p-5 pb-10 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h2 className="text-lg font-bold text-white">Aggiungi esercizio</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Ricerca */}
        <div className="relative mb-3 flex-shrink-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca esercizio…"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            autoFocus
          />
        </div>

        {/* Chips gruppo muscolare */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 flex-shrink-0 no-scrollbar">
          {['Tutti', ...GRUPPI_MUSCOLARI].map((g) => (
            <button
              key={g}
              onClick={() => setGruppoFiltro(g)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                gruppoFiltro === g
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Lista esercizi */}
        <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
          {/* Esercizi custom */}
          {eserciziFiltrati.custom.length > 0 && (
            <>
              <p className="text-xs font-semibold text-gray-500 px-1 pb-1 pt-1">Personalizzati</p>
              {eserciziFiltrati.custom.map((e) => (
                <button
                  key={e.id || e.nome}
                  onClick={() => handleSeleziona(e)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 hover:bg-gray-700 active:scale-98 rounded-xl transition-all text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{e.nome}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-blue-900 text-blue-300 border border-blue-800">
                      Custom
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{e.gruppo}</span>
                </button>
              ))}
              {eserciziFiltrati.db.length > 0 && (
                <p className="text-xs font-semibold text-gray-500 px-1 pb-1 pt-2">Database</p>
              )}
            </>
          )}

          {/* Esercizi database */}
          {eserciziFiltrati.db.map((e) => (
            <button
              key={e.id}
              onClick={() => handleSeleziona(e)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 hover:bg-gray-700 active:scale-98 rounded-xl transition-all text-left"
            >
              <span className="text-sm font-medium text-white">{e.nome}</span>
              <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{e.gruppo}</span>
            </button>
          ))}

          {eserciziFiltrati.custom.length === 0 && eserciziFiltrati.db.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8">Nessun esercizio trovato</p>
          )}
        </div>

        {/* Pulsante crea personalizzato */}
        <div className="pt-4 flex-shrink-0">
          <button
            onClick={() => {
              onClose()
              onCreaPersonalizzato?.()
            }}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-700 hover:border-blue-600 text-gray-400 hover:text-blue-400 rounded-2xl py-3.5 text-sm font-medium transition-colors active:scale-98"
          >
            <Plus size={16} />
            Crea esercizio personalizzato
          </button>
        </div>
      </div>
    </div>
  )
}
