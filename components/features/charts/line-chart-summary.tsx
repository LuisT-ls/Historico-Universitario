'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts'

interface LineChartSummaryProps {
  data: { periodo: string; cr: number }[]
}

export default function LineChartSummary({ data }: LineChartSummaryProps) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.08} />
          <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} tickCount={6} />
          <Tooltip
            formatter={(value: number) => [value.toFixed(2), 'CR Acumulado']}
            contentStyle={{ fontSize: 12, borderRadius: '8px' }}
          />
          <ReferenceLine y={5} stroke="#ef4444" strokeDasharray="4 3" opacity={0.6} label={{ value: '5.0', position: 'right', fontSize: 10, fill: '#ef4444' }} />
          <ReferenceLine y={7} stroke="#f59e0b" strokeDasharray="4 3" opacity={0.5} label={{ value: '7.0', position: 'right', fontSize: 10, fill: '#f59e0b' }} />
          <Line
            type="monotone"
            dataKey="cr"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={{ fill: '#3b82f6', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
            name="CR Acumulado"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
