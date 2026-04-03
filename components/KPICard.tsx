'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { type LucideIcon } from 'lucide-react'

type Props = {
  titulo: string
  valor: number
  delta: number
  icon: LucideIcon
  color: string
}

export default function KPICard({ titulo, valor, delta, icon: Icon, color }: Props) {
  const positivo = delta >= 0

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/30 p-6 shadow-lg shadow-black/5 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${positivo ? 'text-emerald-600' : 'text-red-500'}`}>
          {positivo ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {positivo ? '+' : ''}{delta.toFixed(1)}%
        </div>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-900">{valor.toLocaleString('es-ES')}</p>
        <p className="text-sm text-gray-500 mt-1">{titulo}</p>
      </div>
    </div>
  )
}
