import { useApp } from '../context/AppContext'

export default function Onboarding() {
  const { t, lingua, creaSchedaStandard, creaScheda, setSchedaAttiva } = useApp()

  function handleStandard() {
    const nuova = creaSchedaStandard()
    setSchedaAttiva(nuova.id)
  }

  function handleDaZero() {
    const nuova = creaScheda(lingua === 'it' ? 'La mia scheda' : 'My routine')
    setSchedaAttiva(nuova.id)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center px-6 pt-safe pb-safe">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">{t.onboarding.titolo}</h1>
        <p className="text-sm text-gray-400">{t.onboarding.sottotitolo}</p>
      </div>

      <button
        onClick={handleStandard}
        className="w-full text-left bg-gray-900 border border-gray-800 hover:border-blue-700 rounded-2xl p-5 mb-4 transition-colors active:scale-98"
      >
        <p className="text-base font-bold text-white mb-1">{t.onboarding.standard}</p>
        <p className="text-sm text-gray-400 leading-relaxed">{t.onboarding.standardDesc}</p>
      </button>

      <button
        onClick={handleDaZero}
        className="w-full text-left bg-gray-900 border border-gray-800 hover:border-blue-700 rounded-2xl p-5 transition-colors active:scale-98"
      >
        <p className="text-base font-bold text-white mb-1">{t.onboarding.daZero}</p>
        <p className="text-sm text-gray-400 leading-relaxed">{t.onboarding.daZeroDesc}</p>
      </button>
    </div>
  )
}
