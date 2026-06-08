import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function ProgressChart({ esercizioId, nomeEsercizio, sessions, isInverted = false }) {
  // Estrai il peso rappresentativo per ogni sessione (ultimi 8 allenamenti con dati)
  // Per esercizi normali: massimo. Per esercizi ad assistenza (isInverted): minimo.
  const agg = isInverted ? Math.min : Math.max
  const data = sessions
    .filter((s) => s.completed && s.exercises?.[esercizioId]?.sets?.length > 0)
    .slice(-8)
    .map((s) => {
      const pesi = (s.exercises[esercizioId].sets || [])
        .map((set) => parseFloat(set.weight))
        .filter((p) => !isNaN(p) && p > 0)
      return {
        data: s.date.slice(5).replace('-', '/'), // MM/GG
        peso: pesi.length > 0 ? agg(...pesi) : null,
      }
    })
    .filter((d) => d.peso !== null)

  // PR = miglior risultato assoluto (min se isInverted, max altrimenti)
  const pr = data.length > 0 ? agg(...data.map((d) => d.peso)) : null

  if (data.length < 2) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <p className="text-sm font-semibold text-white mb-1">{nomeEsercizio}</p>
        <p className="text-xs text-gray-500">
          {data.length === 0
            ? 'Nessun dato ancora. Inserisci i pesi durante l\'allenamento!'
            : 'Servono almeno 2 sessioni con dati per il grafico.'}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
      {/* Header con nome esercizio e PR */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-white truncate">{nomeEsercizio}</p>
        {pr && (
          <span className="text-xs font-semibold text-amber-400 flex-shrink-0 ml-2">
            PR {pr} kg
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={110}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis
            dataKey="data"
            tick={{ fill: '#6b7280', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              background: '#111827',
              border: '1px solid #374151',
              borderRadius: 8,
              padding: '6px 10px',
            }}
            labelStyle={{ color: '#9ca3af', fontSize: 11 }}
            itemStyle={{ fontSize: 12, fontWeight: 600 }}
            formatter={(val) => {
              const isPR = val === pr
              return [
                <span style={{ color: isPR ? '#f59e0b' : '#3b82f6' }}>
                  {val} kg{isPR ? ' 🏆' : ''}
                </span>,
                'Peso max',
              ]
            }}
          />
          <Line
            type="monotone"
            dataKey="peso"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={(dotProps) => {
              const { cx, cy, payload } = dotProps
              const isPR = payload.peso === pr
              return (
                <circle
                  key={`dot-${cx}`}
                  cx={cx} cy={cy}
                  r={isPR ? 5 : 3}
                  fill={isPR ? '#f59e0b' : '#3b82f6'}
                  stroke={isPR ? '#f59e0b' : '#3b82f6'}
                  strokeWidth={0}
                />
              )
            }}
            activeDot={(dotProps) => {
              const { cx, cy, payload } = dotProps
              return (
                <circle
                  key={`active-${cx}`}
                  cx={cx} cy={cy} r={6}
                  fill={payload.peso === pr ? '#f59e0b' : '#3b82f6'}
                  strokeWidth={0}
                />
              )
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
