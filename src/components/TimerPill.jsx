import { Play, Pause } from 'lucide-react'

export default function TimerPill({ timer }) {
  const { remaining, running, duration, start, pause } = timer

  const radius = 10
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - remaining / duration)
  const strokeColor =
    remaining <= 10 ? '#ef4444' : remaining <= 30 ? '#f59e0b' : '#3b82f6'

  const minuti = Math.floor(remaining / 60)
  const secondi = String(remaining % 60).padStart(2, '0')

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-lg shadow-black/40">
      {/* Cerchio mini */}
      <svg className="-rotate-90 flex-shrink-0" width="28" height="28" viewBox="0 0 28 28">
        <circle cx="14" cy="14" r={radius} fill="none" stroke="#1f2937" strokeWidth="3" />
        <circle
          cx="14" cy="14" r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.8s linear, stroke 0.3s ease' }}
        />
      </svg>

      {/* Tempo */}
      <span className="text-sm font-bold tabular-nums flex-1" style={{ color: strokeColor }}>
        {minuti}:{secondi}
      </span>

      {/* Play / Pausa */}
      <button
        onClick={running ? pause : start}
        className="p-1.5 bg-gray-800 hover:bg-gray-700 active:scale-90 rounded-xl transition-all"
      >
        {running
          ? <Pause size={14} className="text-gray-300" />
          : <Play size={14} className="text-gray-300" />
        }
      </button>
    </div>
  )
}
