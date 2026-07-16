import { Dumbbell, BarChart2, Settings } from 'lucide-react'

const TABS = [
  { id: 'oggi', label: 'Scheda', Icon: Dumbbell },
  { id: 'storico', label: 'Storico', Icon: BarChart2 },
  { id: 'impostazioni', label: 'Impostazioni', Icon: Settings },
]

export default function BottomNav({ tab, onChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-950 border-t border-gray-800 pb-safe">
      <div className="flex">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              tab === id ? 'text-blue-400' : 'text-gray-500 active:text-gray-300'
            }`}
          >
            <Icon size={22} strokeWidth={tab === id ? 2.5 : 1.8} />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
