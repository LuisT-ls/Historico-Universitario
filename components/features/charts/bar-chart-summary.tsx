'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface BarChartSummaryProps {
  data: any[]
}

export default function BarChartSummary({ data }: BarChartSummaryProps) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="periodo" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="aprovadas" fill="#10b981" name="Aprovadas" />
          <Bar dataKey="total" fill="#3b82f6" name="Total" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
