import { useApp } from '../context/AppContext'

export default function Onboarding() {
  const { creaSchedaStandard, creaScheda, setSchedaAttiva } = useApp()

  function handleStandard() {
    const nuova = creaSchedaStandard()
    setSchedaAttiva(nuova.id)
  }

  function handleDaZero() {
    const nuova = creaScheda('La mia scheda')
    setSchedaAttiva(nuova.id)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center px-6 pt-safe pb-safe">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Benvenuto 👋</h1>
        <p className="text-sm text-gray-400">Come vuoi iniziare?</p>
      </div>

      <button
        onClick={handleStandard}
        className="w-full text-left bg-gray-900 border border-gray-800 hover:border-blue-700 rounded-2xl p-5 mb-4 transition-colors active:scale-98"
      >
        <p className="text-base font-bold text-white mb-1">Usa la scheda standard</p>
        <p className="text-sm text-gray-400 leading-relaxed">
          3 sessioni (Push/Pull/Legs) pronte all'uso — le puoi comunque modificare, rinominare o eliminare in ogni momento.
        </p>
      </button>

      <button
        onClick={handleDaZero}
        className="w-full text-left bg-gray-900 border border-gray-800 hover:border-blue-700 rounded-2xl p-5 transition-colors active:scale-98"
      >
        <p className="text-base font-bold text-white mb-1">Inizia da zero</p>
        <p className="text-sm text-gray-400 leading-relaxed">
          Crea le tue sessioni ed esercizi manualmente, senza nulla di precompilato.
        </p>
      </button>
    </div>
  )
}
