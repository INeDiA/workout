import { useState, useMemo } from 'react'
import { Flame, Calendar, TrendingUp, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ProgressChart from '../components/ProgressChart'
import SessionePassataModal from '../components/SessionePassataModal'
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


const GIORNI_SETTIMANA = ['L', 'M', 'M', 'G', 'V', 'S', 'D']

export default function Storico() {
  const {
    t, sessioniCompletate, streak, workoutData, schede, schedaAttiva,
    activeSession, aggiungiSessionePassata, eliminaSessionePassata,
  } = useApp()

  // Sessione iniziale per il grafico: prima sessione della scheda attiva
  const primaSessioneId = schedaAttiva?.sessioni?.[0]?.id || null
  const [giornoGrafico, setGiornoGrafico] = useState(primaSessioneId)
  const [sessioneSelezionata, setSessioneSelezionata] = useState(null)
  const [giornoAggiunta, setGiornoAggiunta] = useState(null) // { giorno, data } per selettore sessione
  const [activeTab, setActiveTab] = useState('calendario')
  const [annoFiltro, setAnnoFiltro] = useState(new Date().getFullYear())

  const oggiStr = toLocalDateStr(new Date())
  const dateCompletate = new Map(sessioniCompletate.map((s) => [s.date, s]))

  const anniDisponibili = useMemo(() => {
    const anni = new Set(sessioniCompletate.map((s) => parseInt(s.date.slice(0, 4))))
    anni.add(new Date().getFullYear())
    return [...anni].sort()
  }, [sessioniCompletate])

  const mesiDaMostrare = useMemo(() => {
    const annoCorrente = new Date().getFullYear()
    const meseMax = annoFiltro === annoCorrente ? new Date().getMonth() : 11
    return Array.from({ length: meseMax + 1 }, (_, i) => ({ anno: annoFiltro, mese: i })).reverse()
  }, [annoFiltro])

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
        <h1 className="text-2xl font-bold text-white">{t.storico.titolo}</h1>
        <p className="text-sm text-gray-400 mt-1">{t.storico.sottotitolo}</p>
      </div>

      <div className="px-4 space-y-4">
        {/* Statistiche rapide */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame size={15} className="text-orange-400" />
              <span className="text-xl font-bold text-white">{streak}</span>
            </div>
            <p className="text-xs text-gray-500">{t.storico.streak}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Calendar size={15} className="text-blue-400" />
              <span className="text-xl font-bold text-white">{sessioniCompletate.length}</span>
            </div>
            <p className="text-xs text-gray-500">{t.storico.totale}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp size={15} className="text-green-400" />
              <span className="text-xl font-bold text-white">{freqSettimana}</span>
            </div>
            <p className="text-xs text-gray-500">{t.storico.perSettimana}</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-1 gap-1">
          {[['calendario', t.storico.calendario], ['progressione', t.storico.progressione]].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === key ? 'bg-gray-700 text-white' : 'text-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Calendario mensile */}
        {activeTab === 'calendario' && (
        <div>
          {/* Selettore anno */}
          {anniDisponibili.length > 1 && (
            <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
              {anniDisponibili.map((anno) => (
                <button key={anno} onClick={() => setAnnoFiltro(anno)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    annoFiltro === anno ? 'bg-gray-700 text-white' : 'bg-gray-900 border border-gray-800 text-gray-400'
                  }`}
                >
                  {anno}
                </button>
              ))}
            </div>
          )}

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
            {mesiDaMostrare.map(({ anno, mese }) => {
              const nomeMese = new Date(anno, mese, 1)
                .toLocaleDateString(t.storico.localeData, { month: 'long', year: 'numeric' })
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

                      // I giorni passati (o oggi) senza sessione sono tappabili per aggiungere
                      const puoiAggiungere = !sessione && !isFuturo && !(isOggi && activeSession)
                      const El = (sessione || puoiAggiungere) ? 'button' : 'div'
                      return (
                        <El
                          key={data}
                          onClick={
                            sessione
                              ? () => setSessioneSelezionata(sessione)
                              : puoiAggiungere
                              ? () => setGiornoAggiunta({ giorno, data })
                              : undefined
                          }
                          className={`aspect-square rounded-lg flex items-center justify-center transition-all ${
                            dotColor
                              ? dotColor + ' active:scale-90 cursor-pointer'
                              : isFuturo
                              ? 'bg-transparent'
                              : puoiAggiungere
                              ? 'bg-gray-800/40 active:scale-90 active:bg-gray-700/70'
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
                        </El>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        )}

        {/* Grafici progressione pesi */}
        {activeTab === 'progressione' && schedaAttiva?.sessioni?.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-white mb-2">{t.storico.progressionePesi}</h2>
            <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-1 gap-1 overflow-x-auto no-scrollbar mb-3">
              {schedaAttiva.sessioni.map((sess) => (
                <button
                  key={sess.id}
                  onClick={() => setGiornoGrafico(sess.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    giornoGraficoEffettivo === sess.id ? 'bg-gray-700 text-white' : 'text-gray-400'
                  }`}
                >
                  {sess.emoji} {sess.nome}
                </button>
              ))}
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
                    isInverted={!!e.isInverted}
                  />
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Dettaglio allenamento passato */}
      {sessioneSelezionata && (
        <SessionePassataModal
          sessione={sessioneSelezionata}
          onClose={() => setSessioneSelezionata(null)}
          onElimina={(id) => {
            eliminaSessionePassata(id)
            setSessioneSelezionata(null)
          }}
        />
      )}

      {/* Selettore sessione per aggiunta manuale */}
      {giornoAggiunta && (
        <div
          className="fixed inset-0 z-[70] bg-black/70 flex items-end"
          onClick={(e) => e.target === e.currentTarget && setGiornoAggiunta(null)}
        >
          <div className="w-full bg-gray-900 border-t border-gray-800 rounded-t-3xl p-5 pb-10">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-white">{t.storico.aggiungiAllenamento}</h2>
              <button
                onClick={() => setGiornoAggiunta(null)}
                className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-400 mb-4 capitalize">
              {(() => {
                const [a, m, g] = giornoAggiunta.data.split('-').map(Number)
                return new Date(a, m - 1, g).toLocaleDateString(t.storico.localeData, {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })
              })()}
            </p>
            <p className="text-xs text-gray-500 mb-3">{t.storico.qualeSessione}</p>
            <div className={`grid gap-2 ${
              (schedaAttiva?.sessioni?.length || 0) <= 3 ? 'grid-cols-3' : 'grid-cols-2'
            }`}>
              {(schedaAttiva?.sessioni || []).map((sess) => {
                const sessColori = (COLORI_SESSIONE[sess.colore] || COLORI_SESSIONE.blue)
                return (
                  <button
                    key={sess.id}
                    onClick={() => {
                      const nuova = aggiungiSessionePassata(giornoAggiunta.data, sess.id)
                      setGiornoAggiunta(null)
                      setSessioneSelezionata(nuova)
                    }}
                    className={`py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all ${sessColori.pill}`}
                  >
                    <span>{sess.emoji}</span>
                    <span>{sess.nome}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
