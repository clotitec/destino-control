'use client'

import { useEffect, useState } from 'react'
import { FileText, Plus, Download, Eye, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'

type Informe = {
  id: string
  periodo_inicio: string
  periodo_fin: string
  tipo: string
  narrativa_ia: string | null
  created_at: string
}

export default function InformesPage() {
  const [informes, setInformes] = useState<Informe[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => { loadInformes() }, [])

  const loadInformes = async () => {
    setLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data } = await supabase
        .from('informes')
        .select('*')
        .order('created_at', { ascending: false })
      setInformes(data || [])
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const handleGenerar = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/informe/generate', { method: 'POST' })
      const data = await res.json()
      if (data.ok) {
        await loadInformes()
      }
    } catch (e) {
      console.error(e)
    }
    setGenerating(false)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Informes</h1>
          <p className="text-gray-500 mt-1">Informes mensuales generados con IA</p>
        </div>
        <button
          onClick={handleGenerar}
          disabled={generating}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-xl hover:bg-blue-600 transition disabled:opacity-50"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {generating ? 'Generando...' : 'Generar informe mensual'}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : informes.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/30 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">No hay informes</h3>
          <p className="text-sm text-gray-500 mt-2">Genera tu primer informe mensual con IA</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {informes.map(informe => (
            <div key={informe.id} className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/30 p-6 shadow-lg shadow-black/5 hover:shadow-xl transition">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                  {informe.tipo}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900">
                {format(new Date(informe.periodo_inicio), 'MMMM yyyy', { locale: es })}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {format(new Date(informe.periodo_inicio), 'd MMM', { locale: es })} — {format(new Date(informe.periodo_fin), 'd MMM yyyy', { locale: es })}
              </p>
              <p className="text-sm text-gray-600 mt-3 line-clamp-3">
                {informe.narrativa_ia?.slice(0, 150)}...
              </p>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <Link
                  href={`/informes/${informe.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Ver
                </Link>
                <Link
                  href={`/informes/${informe.id}?pdf=1`}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
