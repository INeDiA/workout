import { X, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'

const DURATE_TIMER = [60, 90, 120, 150, 180]

export default function SettingsSheet({ settings, onUpdateSettings, onClose, onGestisciSchede }) {
  const { schedaAttiva } = useApp()

  function set(campo, valore) {
    onUpdateSettings({ ...settings, [campo]: valore })
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
        </div>
      </div>
    </div>
  )
}
