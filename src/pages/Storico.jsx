import { useState, useMemo } from 'react'
import { Flame, Calendar, TrendingUp } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ProgressChart from '../components/ProgressChart'
import { COLORI_SESSIONE } from '../data/workout'

// Data locale in formato YYYY-MM-DD (evita sfasamenti UTC)
function toLocalDateStr(d) {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

// Genera le celle di un mese: null = cella vuota iniziale, oggetto = giorno reale
function getCelleDelMese(anno, mese) {
  const primoDelMese = new Date(anno, mese, 1)
  const giorniNelMese = new Date(anno, mese + 1, 0).getDate()
  const offsetLunedi = (primoDelMese.getDay() + 6) % 7 // Lun=0 … Dom=6

  const celle = Array(offsetLunedi).fill(null)
  for (let g = 1; g <= giorniNelMese; g++) {
    celle.push({ giorno: g, data: toLocalDateStr(new Date(anno, mese, g)) })
  }
  return celle
}

// Calcola i mesi da mostrare: dalla sessione più vecchia (o 3 mesi fa) a oggi
function getMesiDaMostrare(sessioniCompletate) {
  const oggi = new Date()
  const meseOggi = new Date(oggi.getFullYear(), oggi.getMonth(), 1)

  let inizio
  if (sessioniCompletate.length > 0) {
    const primaData = new Date(sessioniCompletate[0].date)
    inizio = new Date(primaData.getFullYear(), primaData.getMonth(), 1)
  } else {
    inizio = new Date(oggi.getFullYear(), oggi.getMonth() - 2, 1) // almeno 3 mesi
  }

  const mesi = []
  let cur = new Date(inizio)
  while (cur <= meseOggi) {
    mesi.push({ anno: cur.getFullYear(), mese: cur.getMonth() })
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1)
  }
  return mesi
}

const GIORNI_SETTIMANA = ['L', 'M', 'M', 'G', 'V', 'S', 'D']

export default function Storico() {
  const { sessioniCompletate, streak, workoutData, schede, schedaAttiva } = useApp()

  // Sessione iniziale per il grafico: prima sessione della scheda attiva
  const primaSessioneId = schedaAttiva?.sessioni?.[0]?.id || null
  const [giornoGrafico, setGiornoGrafico] = useState(primaSessioneId)

  const oggiStr = toLocalDateStr(new Date())
  const dateCompletate = new Map(sessioniCompletate.map((s) => [s.date, s]))
  const mesiDaMostrare = getMesiDaMostrare(sessioniCompletate)

  // Mappa colore sessione: { [sessionId]: dotColorClass }
  // Costruita da TUTTE le sessioni di TUTTE le schede
  const sessionColorMap = useMemo(() => {
    const map = {}
    for (const scheda of (schede || [])) {
      for (const sess of (scheda.sessioni || [])) {
        const colore = sess.colore || 'blue'
        map[sess.id] = (COLORI_SESSIONE[colore] || COLORI_SESSIONE.blue).dot
      }
    }
    return map
  }, [schede])

  // Legenda: sessioni della scheda attiva
  const sessioniLeggenda = schedaAttiva?.sessioni || []

  // Frequenza settimanale (ultimi 30 giorni)
  const sessioni30gg = sessioniCompletate.filter((s) => {
    const diff = (new Date() - new Date(s.date)) / (1000 * 60 * 60 * 24)
    return diff <= 30
  }).length
  const freqSettimana = sessioni30gg > 0 ? (sessioni30gg / 4.3).toFixed(1) : '—'

  // Esercizi per il grafico: dalla sessione selezionata della scheda attiva
  const sessioneGrafico = giornoGrafico ? workoutData[giornoGrafico] : null
  const eserciziGrafico = (sessioneGrafico?.esercizi || []).filter((e) => !e.isBodyweight)

  // Se la sessione selezionata non esiste più, usa la prima disponibile
  const giornoGraficoEffettivo =
    giornoGrafico && workoutData[giornoGrafico]
      ? giornoGrafico
      : primaSessioneId

  return (
    <div className="min-h-screen bg-gray-950 pb-24">
      <div className="pt-safe px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-white">Storico</h1>
        <p className="text-sm text-gray-400 mt-1">Progressi e calendario allenamenti</p>
      </div>

      <div className="px-4 space-y-4">
        {/* Statistiche rapide */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame size={15} className="text-orange-400" />
              <span className="text-xl font-bold text-white">{streak}</span>
            </div>
            <p className="text-xs text-gray-500">Streak</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Calendar size={15} className="text-blue-400" />
              <span className="text-xl font-bold text-white">{sessioniCompletate.length}</span>
            </div>
            <p className="text-xs text-gray-500">Totale</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp size={15} className="text-green-400" />
              <span className="text-xl font-bold text-white">{freqSettimana}</span>
            </div>
            <p className="text-xs text-gray-500">× settimana</p>
          </div>
        </div>

        {/* Calendario mensile */}
        <div>
          {/* Legenda — dinamica in base alla scheda attiva */}
          {sessioniLeggenda.length > 0 && (
            <div className="flex justify-end gap-3 mb-3 flex-wrap">
              {sessioniLeggenda.map((sess) => {
                const dotClass = sessionColorMap[sess.id] || 'bg-blue-500'
                return (
                  <div key={sess.id} className="flex items-center gap-1.5">
                    <div className={`w-2.5 h-2.5 rounded-sm ${dotClass}`} />
                    <span className="text-xs text-gray-400">{sess.nome}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Un blocco per ogni mese, dal più recente al più vecchio */}
          <div className="space-y-6">
            {[...mesiDaMostrare].reverse().map(({ anno, mese }) => {
              const nomeMese = new Date(anno, mese, 1)
                .toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
              const celle = getCelleDelMese(anno, mese)

              return (
                <div key={`${anno}-${mese}`}>
                  <p className="text-sm font-semibold text-white mb-2 capitalize">
                    {nomeMese}
                  </p>

                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {GIORNI_SETTIMANA.map((g, i) => (
                      <div key={i} className="text-center text-[11px] text-gray-600 font-medium py-0.5">
                        {g}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {celle.map((cella, idx) => {
                      if (!cella) {
                        return <div key={`empty-${idx}`} className="aspect-square" />
                      }

                      const { giorno, data } = cella
                      const sessione = dateCompletate.get(data)
                      const isOggi = data === oggiStr
                      const isFuturo = data > oggiStr

                      // Colore del dot per questa sessione (cerca in tutte le schede)
                      const dotColor = sessione
                        ? (sessionColorMap[sessione.dayId] || 'bg-blue-600')
                        : null

                      return (
                        <div
                          key={data}
                          className={`aspect-square rounded-lg flex items-center justify-center ${
                            dotColor
                              ? dotColor
                              : isFuturo
                              ? 'bg-transparent'
                              : 'bg-gray-800/60'
                          } ${isOggi ? 'ring-2 ring-white/70 ring-offset-1 ring-offset-gray-950' : ''}`}
                        >
                          <span
                            className={`text-xs font-medium leading-none ${
                              dotColor
                                ? 'text-white'
                                : isOggi
                                ? 'text-white font-bold'
                                : isFuturo
                                ? 'text-gray-700'
                                : 'text-gray-500'
                            }`}
                          >
                            {giorno}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Grafici progressione pesi */}
        {schedaAttiva?.sessioni?.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white">Progressione pesi</h2>
              <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-1 gap-1 flex-wrap max-w-[60%] justify-end">
                {schedaAttiva.sessioni.map((sess) => (
                  <button
                    key={sess.id}
                    onClick={() => setGiornoGrafico(sess.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      giornoGraficoEffettivo === sess.id ? 'bg-gray-700 text-white' : 'text-gray-400'
                    }`}
                  >
                    {sess.emoji} {sess.nome}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {(workoutData[giornoGraficoEffettivo]?.esercizi || [])
                .filter((e) => !e.isBodyweight)
                .map((e) => (
                  <ProgressChart
                    key={e.id}
                    esercizioId={e.id}
                    nomeEsercizio={e.nome}
                    sessions={sessioniCompletate}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
