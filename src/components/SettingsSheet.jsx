import { useState } from 'react'
import { X, ChevronRight, AlertTriangle } from 'lucide-react'
import { useApp } from '../context/AppContext'

const DURATE_TIMER = [60, 90, 120, 150, 180]

export default function SettingsSheet({ settings, onUpdateSettings, onClose, onGestisciSchede }) {
  const { schedaAttiva } = useApp()
  const [passoReset, setPassoReset] = useState(0) // 0 normale · 1 primo avviso · 2 conferma finale

  function set(campo, valore) {
    onUpdateSettings({ ...settings, [campo]: valore })
  }

  function handleReset() {
    if (passoReset < 2) {
      setPassoReset((p) => p + 1)
      return
    }
    localStorage.clear()
    window.location.reload()
  }

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 flex items-end"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full bg-gray-900 border-t border-gray-800 rounded-t-3xl p-5 pb-10">
        {/* Intestazione */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Impostazioni</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5">
          {/* Scheda attiva — link a gestione schede */}
          <button
            onClick={() => {
              onClose()
              onGestisciSchede?.()
            }}
            className="w-full flex items-center justify-between bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-2xl px-4 py-3.5 transition-colors"
          >
            <div className="text-left">
              <p className="text-sm font-semibold text-white">Scheda attiva</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {schedaAttiva?.nome || 'Nessuna scheda'}
              </p>
            </div>
            <ChevronRight size={18} className="text-gray-500" />
          </button>

          {/* Giorni per settimana */}
          <div>
            <p className="text-sm font-semibold text-white mb-1">Giorni di allenamento</p>
            <p className="text-xs text-gray-400 mb-3">
              Quante sessioni ruotano nella settimana.
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => set('giorniSettimana', n)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    (settings.giorniSettimana ?? 3) === n
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Timer recupero */}
          <div>
            <p className="text-sm font-semibold text-white mb-1">Durata recupero default</p>
            <p className="text-xs text-gray-400 mb-3">
              Durata del timer che parte dopo ogni serie.
            </p>
            <div className="flex gap-2 flex-wrap">
              {DURATE_TIMER.map((d) => (
                <button
                  key={d}
                  onClick={() => set('timerDuration', d)}
                  className={`flex-1 min-w-0 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    settings.timerDuration === d
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>
          {/* Reset database */}
          <div className="pt-2">
            <div className="border-t border-gray-800 pt-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Zona pericolosa</p>

              {passoReset > 0 && (
                <div className="flex items-start gap-2 bg-red-950 border border-red-800 rounded-xl p-3 mb-3">
                  <AlertTriangle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300 leading-relaxed">
                    {passoReset === 1
                      ? 'Verranno cancellati tutti gli allenamenti, le schede personalizzate e le impostazioni. Questa azione è irreversibile.'
                      : 'Ultima conferma — dopo non si torna indietro.'}
                  </p>
                </div>
              )}

              <button
                onClick={handleReset}
                className={`w-full py-3 rounded-2xl text-sm font-semibold transition-all active:scale-98 border ${
                  passoReset === 0
                    ? 'bg-gray-900 border-gray-700 text-gray-400 hover:border-red-800 hover:text-red-400'
                    : passoReset === 1
                    ? 'bg-red-950 border-red-700 text-red-300'
                    : 'bg-red-700 border-red-600 text-white'
                }`}
              >
                {passoReset === 0 && 'Cancella tutti i dati'}
                {passoReset === 1 && 'Sei sicuro? Tocca ancora per continuare'}
                {passoReset === 2 && 'Sì, cancella tutto e ricomincia'}
              </button>

              {passoReset > 0 && (
                <button
                  onClick={() => setPassoReset(0)}
                  className="w-full mt-2 py-2 text-xs text-gray-600 hover:text-gray-400 transition-colors"
                >
                  Annulla
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
