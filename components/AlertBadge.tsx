'use client'

import { TrendingUp, TrendingDown, AlertTriangle, Info } from 'lucide-react'

type Props = {
  tipo: string
  mensaje: string
  delta?: number
  fecha?: string
  leida?: boolean
}

const CONFIG = {
  subida: { icon: TrendingUp, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', iconColor: 'text-emerald-500' },
  bajada: { icon: TrendingDown, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', iconColor: 'text-red-500' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', iconColor: 'text-amber-500' },
  info: { icon: Info, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', iconColor: 'text-blue-500' },
}

export default function AlertBadge({ tipo, mensaje, delta, fecha, leida }: Props) {
  const cfg = CONFIG[tipo as keyof typeof CONFIG] || CONFIG.info
  const Icon = cfg.icon

  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl border ${cfg.bg} ${cfg.border} ${leida ? 'opacity-60' : ''}`}>
      <div className={`mt-0.5 ${cfg.iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${cfg.text}`}>{mensaje}</p>
        {fecha && <p className="text-xs text-gray-400 mt-1">{fecha}</p>}
      </div>
      {delta !== undefined && (
        <span className={`text-sm font-bold ${cfg.text}`}>
          {delta > 0 ? '+' : ''}{delta}%
        </span>
      )}
    </div>
  )
}
