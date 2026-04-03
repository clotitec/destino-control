'use client'

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

type Props = {
  data: Array<Record<string, unknown>>
  lines: Array<{ key: string; color: string; label: string }>
}

export default function TrendChart({ data, lines }: Props) {
  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/30 p-6 shadow-lg shadow-black/5">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolución últimos 30 días</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="fecha"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickFormatter={(v: string) => {
                try { return format(parseISO(v), 'd MMM', { locale: es }) } catch { return v }
              }}
            />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} width={50} />
            <Tooltip
              contentStyle={{
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}
              labelFormatter={(v) => {
                try { return format(parseISO(String(v)), "d 'de' MMMM", { locale: es }) } catch { return String(v) }
              }}
            />
            {lines.map(l => (
              <Line
                key={l.key}
                type="monotone"
                dataKey={l.key}
                stroke={l.color}
                strokeWidth={2}
                dot={false}
                name={l.label}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
