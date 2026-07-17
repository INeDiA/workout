import { useState } from 'react'
import { Play, Pause, RotateCcw, Settings } from 'lucide-react'
import { useApp } from '../context/AppContext'

const DURATE_PREDEFINITE = [60, 90, 120, 150, 180]

export default function Timer({ timer }) {
  const { t } = useApp()
  const { remaining, running, duration, start, pause, reset, changeDuration } = timer
  const [showOptions, setShowOptions] = useState(false)

  // Parametri cerchio SVG
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const percent = remaining / duration
  const strokeDashoffset = circumference * (1 - percent)

  // Colore dinamico in base al tempo residuo
  const strokeColor =
    remaining <= 10 ? '#ef4444' : remaining <= 30 ? '#f59e0b' : '#3b82f6'

  const minuti = Math.floor(remaining / 60)
  const secondi = String(remaining % 60).padStart(2, '0')

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
      <div className="flex items-center gap-4">
        {/* Cerchio conto alla rovescia */}
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r={radius} fill="none" stroke="#1f2937" strokeWidth="5" />
            <circle
              cx="36"
              cy="36"
              r={radius}
              fill="none"
              stroke={strokeColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.8s linear, stroke 0.3s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold tabular-nums" style={{ color: strokeColor }}>
              {minuti}:{secondi}
            </span>
          </div>
        </div>

        {/* Controlli */}
        <div className="flex-1">
          <p className="text-xs text-gray-400 mb-2">{t.timer.recupero}: {duration}s</p>
          <div className="flex gap-2">
            <button
              onClick={running ? pause : start}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl py-2 px-3 text-sm font-medium transition-all"
            >
              {running ? <Pause size={15} /> : <Play size={15} />}
              {running ? t.timer.pausa : t.timer.start}
            </button>
            <button
              onClick={reset}
              className="p-2.5 bg-gray-800 hover:bg-gray-700 active:scale-95 rounded-xl transition-all"
              title={t.timer.reset}
            >
              <RotateCcw size={15} className="text-gray-400" />
            </button>
            <button
              onClick={() => setShowOptions(!showOptions)}
              className={`p-2.5 rounded-xl transition-all active:scale-95 ${
                showOptions ? 'bg-blue-900 text-blue-300' : 'bg-gray-800 hover:bg-gray-700 text-gray-400'
              }`}
              title={t.timer.durata}
            >
              <Settings size={15} />
            </button>
          </div>

          {/* Selezione durata */}
          {showOptions && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {DURATE_PREDEFINITE.map((d) => (
                <button
                  key={d}
                  onClick={() => { changeDuration(d); setShowOptions(false) }}
                  className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                    duration === d
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {d}s
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
