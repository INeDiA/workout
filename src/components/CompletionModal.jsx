import { useMemo, useState } from 'react'
import { Trophy, Clock, BarChart2, Flame } from 'lucide-react'
import { useApp } from '../context/AppContext'

function formatDurata(ms) {
  const min = Math.round(ms / 60000)
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

export default function CompletionModal({ sessione, workoutData, sessioniCompletate, streak, onConferma }) {
  const { t } = useApp()
  const giorno = workoutData[sessione.dayId]
  const esercizi = giorno?.esercizi || []

  // Catturato una sola volta all'apertura del modal — la durata è "congelata"
  // al momento in cui l'allenamento è stato completato, non un cronometro live.
  const [ora] = useState(() => Date.now())

  const stats = useMemo(() => {
    const durata = sessione.startedAt ? ora - sessione.startedAt : null

    // Serie completate
    let serieCompletate = 0
    let serieTotali = 0

    for (const es of esercizi) {
      if (es.isBodyweight) continue
      const sets = sessione.exercises[es.id]?.sets || []
      serieTotali += es.serie
      for (const s of sets) {
        if (s.done) serieCompletate++
      }
    }

    // PR battuti oggi
    const pr = []
    for (const es of esercizi) {
      if (es.isBodyweight || es.isTime) continue
      const sets = sessione.exercises[es.id]?.sets || []
      const pesiFatti = sets.filter(s => s.done).map(s => parseFloat(s.weight)).filter(p => !isNaN(p) && p > 0)
      if (pesiFatti.length === 0) continue

      const maxOggi = es.isInverted ? Math.min(...pesiFatti) : Math.max(...pesiFatti)

      // Massimo storico (esclude la sessione corrente)
      const agg = es.isInverted ? Math.min : Math.max
      const storici = sessioniCompletate
        .filter(s => s.exercises?.[es.id]?.sets?.length > 0)
        .map(s => {
          const pesi = s.exercises[es.id].sets.map(st => parseFloat(st.weight)).filter(p => !isNaN(p) && p > 0)
          return pesi.length > 0 ? agg(...pesi) : null
        })
        .filter(p => p !== null)

      const maxStorico = storici.length > 0 ? agg(...storici) : null

      const isPR = maxStorico === null
        || (es.isInverted ? maxOggi < maxStorico : maxOggi > maxStorico)

      if (isPR) pr.push({ nome: es.nome, peso: maxOggi, isInverted: es.isInverted })
    }

    const completamento = serieTotali > 0 ? Math.round((serieCompletate / serieTotali) * 100) : 0

    return { durata, serieCompletate, serieTotali, completamento, pr }
  }, [sessione, esercizi, sessioniCompletate, ora])

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 flex items-end">
      <div className="w-full bg-gray-900 border-t border-gray-800 rounded-t-3xl p-6 pb-safe max-h-[92dvh] overflow-y-auto">

        {/* Intestazione */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-green-900 border border-green-700 rounded-full flex items-center justify-center mb-3">
            <Trophy size={28} className="text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white">{t.completionModal.titolo}</h2>
          {giorno && (
            <p className="text-sm text-gray-400 mt-1">{giorno.emoji} {giorno.focus || giorno.nome}</p>
          )}
        </div>

        {/* Statistiche */}
        <div className={`grid gap-3 mb-4 ${stats.durata ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {stats.durata && (
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 text-center">
              <Clock size={16} className="text-blue-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{formatDurata(stats.durata)}</p>
              <p className="text-xs text-gray-500">{t.completionModal.durata}</p>
            </div>
          )}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 text-center">
            <BarChart2 size={16} className="text-cyan-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{stats.serieCompletate}/{stats.serieTotali}</p>
            <p className="text-xs text-gray-500">{t.completionModal.serie}</p>
          </div>
          {streak > 0 && (
            <div className="col-span-2 bg-gray-800 border border-gray-700 rounded-2xl p-4 text-center">
              <Flame size={16} className="text-orange-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">
                {streak} {streak === 1 ? t.completionModal.streakSettimana : t.completionModal.streakSettimane} {t.completionModal.diFila}
              </p>
              <p className="text-xs text-gray-500">Streak</p>
            </div>
          )}
        </div>

        {/* Barra completamento */}
        {stats.serieTotali > 0 && (
          <div className="mb-4">
            <div className="flex justify-between mb-1.5">
              <span className="text-xs text-gray-500">{t.completionModal.completamento}</span>
              <span className="text-xs font-semibold text-white">{stats.completamento}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${stats.completamento}%` }}
              />
            </div>
          </div>
        )}

        {/* PR battuti */}
        {stats.pr.length > 0 && (
          <div className="bg-amber-950/60 border border-amber-800/50 rounded-2xl p-4 mb-4">
            <p className="text-xs font-semibold text-amber-400 mb-2">
              🏆 {stats.pr.length === 1 ? t.completionModal.nuovoPR : `${stats.pr.length} ${t.completionModal.nuoviPR}`}
            </p>
            {stats.pr.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <p className="text-xs text-amber-200">{p.nome}</p>
                <p className="text-xs font-bold text-amber-400">{p.peso} kg</p>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onConferma}
          className="w-full bg-green-600 hover:bg-green-500 active:scale-98 text-white font-semibold rounded-2xl py-4 transition-all"
        >
          {t.completionModal.chiudi}
        </button>
      </div>
    </div>
  )
}
