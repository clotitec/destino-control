'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

type Props = {
  titulo: string
  valorActual: number
  valorAnterior: number
  formato?: (v: number) => string
}

export default function CompareCard({ titulo, valorActual, valorAnterior, formato }: Props) {
  const delta = valorAnterior > 0 ? ((valorActual - valorAnterior) / valorAnterior) * 100 : 0
  const positivo = delta > 0
  const neutro = Math.abs(delta) < 1
  const fmt = formato || ((v: number) => v.toLocaleString('es-ES'))

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/30 p-6 shadow-lg shadow-black/5">
      <p className="text-sm text-gray-500 mb-2">{titulo}</p>
      <div className="flex items-end gap-4">
        <div>
          <p className="text-3xl font-bold text-gray-900">{fmt(valorActual)}</p>
          <p className="text-sm text-gray-400 mt-1">anterior: {fmt(valorAnterior)}</p>
        </div>
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold ${
          neutro
            ? 'bg-gray-100 text-gray-500'
            : positivo
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-red-100 text-red-700'
        }`}>
          {neutro ? <Minus className="w-4 h-4" /> : positivo ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {positivo ? '+' : ''}{delta.toFixed(1)}%
        </div>
      </div>
    </div>
  )
}
