'use client'

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

type Props = {
  data: Array<{ idioma: string; valor: number }>
  titulo: string
}

const COLORES: Record<string, string> = {
  es: '#3b82f6',
  en: '#10b981',
  fr: '#f59e0b',
  de: '#ef4444',
  otros: '#8b5cf6',
}

const LABELS: Record<string, string> = {
  es: 'Español',
  en: 'Inglés',
  fr: 'Francés',
  de: 'Alemán',
  otros: 'Otros',
}

export default function BarRanking({ data, titulo }: Props) {
  const formattedData = data.map(d => ({
    ...d,
    label: LABELS[d.idioma] || d.idioma,
    fill: COLORES[d.idioma] || '#6b7280',
  }))

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/30 p-6 shadow-lg shadow-black/5">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{titulo}</h3>
      <div className="space-y-3">
        {formattedData.map(item => {
          const max = Math.max(...data.map(d => d.valor), 1)
          const pct = (item.valor / max) * 100
          return (
            <div key={item.idioma} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-20 text-right">{item.label}</span>
              <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className="h-full rounded-lg transition-all duration-500 flex items-center px-3"
                  style={{ width: `${pct}%`, backgroundColor: item.fill }}
                >
                  <span className="text-xs font-bold text-white whitespace-nowrap">
                    {item.valor.toLocaleString('es-ES')}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
