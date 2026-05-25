import { X } from 'lucide-react'

const DURATE_TIMER = [60, 90, 120, 150, 180]
const GIORNI_SETTIMANA = [1, 2, 3]

export default function SettingsSheet({ settings, onUpdateSettings, onClose }) {
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

        <div className="space-y-6">
          {/* Giorni per settimana */}
          <div>
            <p className="text-sm font-semibold text-white mb-1">
              Giorni di allenamento per settimana
            </p>
            <p className="text-xs text-gray-400 mb-3">
              Determina quanti giorni ruotano (A→B→C). Con 2 giorni la rotazione è A→B→A→B.
            </p>
            <div className="flex gap-3">
              {GIORNI_SETTIMANA.map((n) => (
                <button
                  key={n}
                  onClick={() => set('giorniSettimana', n)}
                  className={`flex-1 py-3 rounded-2xl text-sm font-bold border transition-colors ${
                    settings.giorniSettimana === n
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {n} {n === 1 ? 'giorno' : 'giorni'}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Giorni attivi:{' '}
              <span className="text-gray-300 font-medium">
                {['A', 'B', 'C'].slice(0, settings.giorniSettimana).join(' · ')}
              </span>
            </p>
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
        </div>
      </div>
    </div>
  )
}
