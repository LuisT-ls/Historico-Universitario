'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid, Legend } from 'recharts'

interface LineChartSummaryProps {
  data: { periodo: string; cr: number; mediaSemestre: number | null }[]
}

// Tooltip customizado para mostrar ambas as linhas lado a lado
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const cr = payload.find((p: any) => p.dataKey === 'cr')
  const media = payload.find((p: any) => p.dataKey === 'mediaSemestre')
  return (
    <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      <p style={{ fontWeight: 700, marginBottom: 4 }}>{label}</p>
      {cr && (
        <p style={{ color: '#3b82f6', margin: '2px 0' }}>
          CR Acumulado: <strong>{Number(cr.value).toFixed(2)}</strong>
        </p>
      )}
      {media && media.value !== null && (
        <p style={{ color: '#10b981', margin: '2px 0' }}>
          Média do Semestre: <strong>{Number(media.value).toFixed(2)}</strong>
        </p>
      )}
    </div>
  )
}

export default function LineChartSummary({ data }: LineChartSummaryProps) {
  const hasMedia = data.some(d => d.mediaSemestre !== null)

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 24, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.08} />
          <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} tickCount={6} />
          <Tooltip content={<CustomTooltip />} />
          {hasMedia && (
            <Legend
              iconType="line"
              iconSize={16}
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              formatter={(value) =>
                value === 'cr' ? 'CR Acumulado' : 'Média do Semestre'
              }
            />
          )}
          <ReferenceLine y={5} stroke="#ef4444" strokeDasharray="4 3" opacity={0.6} label={{ value: '5.0', position: 'right', fontSize: 10, fill: '#ef4444' }} />
          <ReferenceLine y={7} stroke="#f59e0b" strokeDasharray="4 3" opacity={0.5} label={{ value: '7.0', position: 'right', fontSize: 10, fill: '#f59e0b' }} />

          {/* Linha tracejada: média isolada do semestre */}
          {hasMedia && (
            <Line
              type="monotone"
              dataKey="mediaSemestre"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={{ fill: '#10b981', r: 3.5, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
              connectNulls={false}
              name="mediaSemestre"
            />
          )}

          {/* Linha sólida: CR acumulado */}
          <Line
            type="monotone"
            dataKey="cr"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={{ fill: '#3b82f6', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
            name="cr"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
