'use client'

import { useState } from 'react'
import { Calendar } from 'lucide-react'

type Props = {
  onRangeChange: (inicio: string, fin: string) => void
  defaultInicio?: string
  defaultFin?: string
}

export default function DateRangePicker({ onRangeChange, defaultInicio, defaultFin }: Props) {
  const [inicio, setInicio] = useState(defaultInicio || '')
  const [fin, setFin] = useState(defaultFin || '')

  const handleApply = () => {
    if (inicio && fin) onRangeChange(inicio, fin)
  }

  return (
    <div className="flex items-center gap-3 bg-white/60 backdrop-blur-xl rounded-xl border border-white/30 px-4 py-2">
      <Calendar className="w-4 h-4 text-gray-400" />
      <input
        type="date"
        value={inicio}
        onChange={e => setInicio(e.target.value)}
        className="bg-transparent text-sm text-gray-700 outline-none"
      />
      <span className="text-gray-400">—</span>
      <input
        type="date"
        value={fin}
        onChange={e => setFin(e.target.value)}
        className="bg-transparent text-sm text-gray-700 outline-none"
      />
      <button
        onClick={handleApply}
        className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition"
      >
        Aplicar
      </button>
    </div>
  )
}
