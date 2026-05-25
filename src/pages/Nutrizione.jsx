import { Leaf, Check } from 'lucide-react'
import { useApp } from '../context/AppContext'

function CheckItem({ label, checked, onChange, disabled }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
        disabled ? 'opacity-60 cursor-default' : 'active:scale-98'
      } ${
        checked
          ? 'bg-green-950 border-green-800 text-green-300'
          : 'bg-gray-800 border-gray-700 text-gray-300'
      }`}
    >
      <div
        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          checked ? 'bg-green-600 border-green-600' : 'border-gray-600'
        }`}
      >
        {checked && <Check size={13} className="text-white" strokeWidth={3} />}
      </div>
      <span className="text-sm font-medium text-left">{label}</span>
    </button>
  )
}

export default function Nutrizione() {
  const { giornoOggi, activeSession, aggiornaNutrizione, oggi, sessioniCompletate } = useApp()

  const sessioneOggi = activeSession || sessioniCompletate.find((s) => s.date === oggi)
  const nutrition = sessioneOggi?.nutrition || {
    pre: false,
    integratori: false,
    post: false,
    note: '',
  }

  const haSessione = !!activeSession
  const dataFormattata = new Date().toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  function toggle(campo) {
    aggiornaNutrizione({ [campo]: !nutrition[campo] })
  }

  // Quanti check completati
  const totCheck = 3
  const checkCompletati = [nutrition.pre, nutrition.integratori, nutrition.post].filter(Boolean).length

  return (
    <div className="min-h-screen bg-gray-950 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-emerald-900/20 to-gray-950 pt-safe px-4 pt-6 pb-5">
        <div className="flex items-center gap-2 mb-2">
          <Leaf size={15} className="text-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">Diario nutrizionale</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Nutrizione</h1>
        <p className="text-sm text-gray-400 mt-1 capitalize">
          Giorno {giornoOggi} · {dataFormattata}
        </p>
      </div>

      <div className="px-4 mt-2 space-y-4">
        {/* Checklist giornaliera */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Checklist di oggi</h2>
            {sessioneOggi && (
              <span className="text-xs font-medium text-gray-400">
                {checkCompletati}/{totCheck}
              </span>
            )}
          </div>

          {!haSessione && !sessioneOggi && (
            <p className="text-xs text-gray-500 mb-3">
              Avvia una sessione di allenamento per tracciare la nutrizione.
            </p>
          )}

          <div className={`space-y-2 ${!haSessione && !sessioneOggi ? 'opacity-40 pointer-events-none' : ''}`}>
            <CheckItem
              label="Pre-allenamento completato"
              checked={nutrition.pre}
              onChange={() => toggle('pre')}
              disabled={!haSessione}
            />
            <CheckItem
              label="Integratori assunti"
              checked={nutrition.integratori}
              onChange={() => toggle('integratori')}
              disabled={!haSessione}
            />
            <CheckItem
              label="Post-allenamento completato"
              checked={nutrition.post}
              onChange={() => toggle('post')}
              disabled={!haSessione}
            />
          </div>

          {/* Nota libera */}
          {(haSessione || sessioneOggi) && (
            <textarea
              value={nutrition.note}
              onChange={(e) => haSessione && aggiornaNutrizione({ note: e.target.value })}
              readOnly={!haSessione}
              placeholder="Note libere (cosa hai mangiato, come ti sei sentito…)"
              className={`w-full mt-3 bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none ${
                !haSessione ? 'opacity-60 cursor-default' : ''
              }`}
              rows={3}
            />
          )}
        </div>

        {/* Promemoria generico */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <h2 className="text-sm font-semibold text-white mb-3">Linee guida generali</h2>
          <ul className="space-y-2.5">
            {[
              '⏱ Pre-allenamento: pasto 60-90 min prima, ricco di carboidrati e proteine',
              '💧 Idratazione: almeno 500 ml di acqua durante la sessione',
              '⚡ Post-allenamento: proteine + carboidrati entro 30-60 min dal termine',
              '😴 Recupero: 7-9 ore di sonno per ottimizzare la sintesi proteica',
            ].map((item, i) => (
              <li key={i} className="text-sm text-gray-300 leading-snug">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
