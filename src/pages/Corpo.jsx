import { useState, useCallback } from 'react'
import { Scale, HeartPulse, Moon, Zap } from 'lucide-react'
import { useLocalStorage } from '../hooks/useStorage'
import {
  LineChart, Line, ComposedChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

// ── Utilità data locale ────────────────────────────────────────────────────────
function dataOggi() {
  const d = new Date()
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

// ── Hook peso ─────────────────────────────────────────────────────────────────
function usePesoLog() {
  const [log, setLog] = useLocalStorage('sm_peso_log', [])

  function salva(pesoStr) {
    const peso = parseFloat(pesoStr.replace(',', '.'))
    if (isNaN(peso) || peso <= 0) return
    const oggi = dataOggi()
    setLog((prev) => {
      const altri = prev.filter((e) => e.date !== oggi)
      return [...altri, { date: oggi, peso }].sort((a, b) => a.date.localeCompare(b.date))
    })
  }

  return { log, salva }
}

// ── Hook recovery ─────────────────────────────────────────────────────────────
function useRecoveryLog() {
  const [log, setLog] = useLocalStorage('sm_recovery_log', [])
  const oggi = dataOggi()
  const oggiRecord = log.find((e) => e.date === oggi) || null

  function salva(dati) {
    setLog((prev) => {
      const altri = prev.filter((e) => e.date !== oggi)
      return [...altri, { date: oggi, ...dati }].sort((a, b) => a.date.localeCompare(b.date))
    })
  }

  return { log, oggiRecord, salva }
}

// ── Costanti ──────────────────────────────────────────────────────────────────
const ENERGIA_EMOJI = ['😫', '😔', '😐', '🙂', '💪']
const SONNO_MIN = 4
const SONNO_MAX = 12

export default function Corpo() {
  const { log: pesoLog, salva: salvaPeso } = usePesoLog()
  const { log: recoveryLog, oggiRecord, salva: salvaRecovery } = useRecoveryLog()

  // ── Peso ──────────────────────────────────────────────────────────────────
  const ultimoPeso = pesoLog.length > 0 ? pesoLog[pesoLog.length - 1] : null
  const [pesoInput, setPesoInput] = useState(ultimoPeso ? String(ultimoPeso.peso) : '')

  // Grafico: ultimi 60 giorni con dati
  const pesoChartData = pesoLog.slice(-60).map((e) => ({
    data: e.date.slice(5).replace('-', '/'),
    peso: e.peso,
  }))
  const pesoMax = pesoChartData.length > 0 ? Math.max(...pesoChartData.map(d => d.peso)) : null
  const pesoMin = pesoChartData.length > 0 ? Math.min(...pesoChartData.map(d => d.peso)) : null

  // ── Recovery ─────────────────────────────────────────────────────────────
  const recoveryChartData = recoveryLog.slice(-14).map((e) => ({
    data: e.date.slice(5).replace('-', '/'),
    energia: e.energia ?? null,
    dolori: e.dolori ?? null,
    sonno: e.sonno ?? null,
  }))

  const [energia, setEnergia] = useState(oggiRecord?.energia ?? null)
  const [sonno, setSonno] = useState(oggiRecord?.sonno ?? 7)
  const [dolori, setDolori] = useState(oggiRecord?.dolori ?? null)

  const autoSalvaRecovery = useCallback((campo, valore) => {
    const aggiornato = {
      energia: campo === 'energia' ? valore : energia,
      sonno: campo === 'sonno' ? valore : sonno,
      dolori: campo === 'dolori' ? valore : dolori,
    }
    // Salva solo se almeno un campo è compilato
    if (aggiornato.energia !== null || aggiornato.dolori !== null) {
      salvaRecovery(aggiornato)
    }
  }, [energia, sonno, dolori, salvaRecovery])

  function handleEnergia(v) { setEnergia(v); autoSalvaRecovery('energia', v) }
  function handleSonno(v) {
    const clamped = Math.max(SONNO_MIN, Math.min(SONNO_MAX, v))
    setSonno(clamped)
    autoSalvaRecovery('sonno', clamped)
  }
  function handleDolori(v) { setDolori(v); autoSalvaRecovery('dolori', v) }

  return (
    <div className="min-h-screen bg-gray-950 pb-24">
      <div className="pt-safe px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-white">Corpo</h1>
        <p className="text-sm text-gray-400 mt-1">Peso e recupero</p>
      </div>

      <div className="px-4 space-y-4">

        {/* ── Sezione Peso ────────────────────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Scale size={15} className="text-blue-400" />
              <p className="text-sm font-semibold text-white">Peso corporeo</p>
            </div>
            {ultimoPeso && (
              <p className="text-xs text-gray-500">
                Ultimo: <span className="text-white font-medium">{ultimoPeso.peso} kg</span>
              </p>
            )}
          </div>

          {/* Input peso */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5">
              <input
                type="text"
                inputMode="decimal"
                value={pesoInput}
                onChange={(e) => setPesoInput(e.target.value.replace(',', '.'))}
                placeholder="es. 75.5"
                className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 focus:outline-none"
              />
              <span className="text-xs text-gray-500 flex-shrink-0">kg</span>
            </div>
            <button
              onClick={() => salvaPeso(pesoInput)}
              disabled={!pesoInput.trim()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-40 text-white text-sm font-medium rounded-xl transition-all"
            >
              Salva
            </button>
          </div>

          {/* Grafico */}
          {pesoChartData.length >= 2 ? (
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={pesoChartData} margin={{ top: 4, right: 8, bottom: 0, left: -24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="data" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, padding: '6px 10px' }}
                  labelStyle={{ color: '#9ca3af', fontSize: 11 }}
                  itemStyle={{ fontSize: 12, fontWeight: 600 }}
                  formatter={(val) => [`${val} kg`, 'Peso']}
                />
                <Line
                  type="monotone"
                  dataKey="peso"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={(props) => {
                    const { cx, cy, payload } = props
                    const isLast = payload.data === pesoChartData[pesoChartData.length - 1]?.data
                    return (
                      <circle key={cx} cx={cx} cy={cy}
                        r={isLast ? 5 : 3}
                        fill={isLast ? '#60a5fa' : '#3b82f6'}
                        strokeWidth={0}
                      />
                    )
                  }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-gray-500 text-center py-4">
              {pesoChartData.length === 0
                ? 'Inserisci il tuo peso per iniziare a tracciare.'
                : 'Aggiungi un secondo giorno per vedere il grafico.'}
            </p>
          )}

          {/* Delta */}
          {pesoChartData.length >= 2 && pesoMax !== null && pesoMin !== null && (
            <div className="flex justify-between mt-3 pt-3 border-t border-gray-800">
              <div className="text-center">
                <p className="text-xs text-gray-500">Min</p>
                <p className="text-sm font-semibold text-white">{pesoMin} kg</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Max</p>
                <p className="text-sm font-semibold text-white">{pesoMax} kg</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Δ</p>
                <p className={`text-sm font-semibold ${
                  (ultimoPeso?.peso ?? 0) <= pesoChartData[0].peso ? 'text-green-400' : 'text-rose-400'
                }`}>
                  {((ultimoPeso?.peso ?? 0) - pesoChartData[0].peso).toFixed(1)} kg
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Sezione Recovery ────────────────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <HeartPulse size={15} className="text-rose-400" />
            <p className="text-sm font-semibold text-white">Come ti senti oggi?</p>
          </div>

          {/* Energia */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={13} className="text-yellow-400" />
              <p className="text-xs font-medium text-gray-400">Energia</p>
            </div>
            <div className="flex gap-2">
              {ENERGIA_EMOJI.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => handleEnergia(i + 1)}
                  className={`flex-1 py-2 rounded-xl text-xl transition-all active:scale-90 ${
                    energia === i + 1
                      ? 'bg-yellow-950 border border-yellow-700 scale-105'
                      : 'bg-gray-800 border border-gray-700 opacity-50'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Sonno */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Moon size={13} className="text-blue-400" />
              <p className="text-xs font-medium text-gray-400">Sonno</p>
            </div>
            <div className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5">
              <button
                onClick={() => handleSonno(sonno - 1)}
                disabled={sonno <= SONNO_MIN}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 text-lg font-bold transition-colors"
              >−</button>
              <p className="flex-1 text-center text-sm font-semibold text-white tabular-nums">
                {sonno} <span className="text-gray-500 font-normal">ore</span>
              </p>
              <button
                onClick={() => handleSonno(sonno + 1)}
                disabled={sonno >= SONNO_MAX}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 text-lg font-bold transition-colors"
              >+</button>
            </div>
          </div>

          {/* Dolori muscolari */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-400">Dolori muscolari</p>
              <p className="text-xs text-gray-600">
                {dolori === null ? '—' : ['Nessuno', 'Leggeri', 'Moderati', 'Intensi', 'Molto intensi'][dolori - 1]}
              </p>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  onClick={() => handleDolori(v)}
                  className={`flex-1 h-8 rounded-lg transition-all active:scale-90 border ${
                    dolori !== null && v <= dolori
                      ? v <= 2 ? 'bg-blue-600 border-blue-500'
                        : v <= 3 ? 'bg-yellow-500 border-yellow-400'
                        : 'bg-rose-600 border-rose-500'
                      : 'bg-gray-800 border-gray-700'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1 px-0.5">
              <span className="text-xs text-gray-600">Nessuno</span>
              <span className="text-xs text-gray-600">Molto intensi</span>
            </div>
          </div>

          {oggiRecord && (
            <p className="text-xs text-gray-600 text-right mt-3">Salvato automaticamente ✓</p>
          )}
        </div>

        {/* ── Storico recovery ────────────────────────────────────────── */}
        {recoveryChartData.length >= 2 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <p className="text-sm font-semibold text-white mb-3">Storico recovery</p>
            <ResponsiveContainer width="100%" height={130}>
              <ComposedChart data={recoveryChartData} margin={{ top: 4, right: 8, bottom: 0, left: -24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="data" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" domain={[0, 5]} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} ticks={[1,2,3,4,5]} />
                <YAxis yAxisId="right" orientation="right" domain={[4, 12]} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, padding: '6px 10px' }}
                  labelStyle={{ color: '#9ca3af', fontSize: 11 }}
                  itemStyle={{ fontSize: 11 }}
                  formatter={(val, name) => {
                    if (val === null) return ['-', name]
                    const labels = { energia: 'Energia', dolori: 'Dolori', sonno: 'Sonno' }
                    const suffix = name === 'sonno' ? ' ore' : '/5'
                    return [`${val}${suffix}`, labels[name] || name]
                  }}
                />
                <Bar yAxisId="right" dataKey="sonno" fill="#3b82f6" opacity={0.5} radius={[3, 3, 0, 0]} />
                <Line yAxisId="left" type="monotone" dataKey="energia" stroke="#facc15" strokeWidth={2} dot={{ r: 3, fill: '#facc15', strokeWidth: 0 }} connectNulls />
                <Line yAxisId="left" type="monotone" dataKey="dolori" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3, fill: '#f43f5e', strokeWidth: 0 }} connectNulls />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 justify-center">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-yellow-400 inline-block rounded" />
                <span className="text-xs text-gray-500">Energia</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-rose-500 inline-block rounded" />
                <span className="text-xs text-gray-500">Dolori</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-blue-500/50 inline-block rounded-sm" />
                <span className="text-xs text-gray-500">Sonno</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
