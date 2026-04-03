'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { ArrowLeft, Download, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import dynamic from 'next/dynamic'
import InformePreview from '@/components/InformePreview'

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
  { ssr: false }
)

const InformePDF = dynamic(() => import('@/components/InformePDF'), { ssr: false })

type Informe = {
  id: string
  municipio_id: string
  periodo_inicio: string
  periodo_fin: string
  tipo: string
  datos_snapshot: Record<string, number>
  narrativa_ia: string
  created_at: string
}

export default function InformeDetallePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [informe, setInforme] = useState<Informe | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInforme()
  }, [params.id])

  const loadInforme = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data } = await supabase
        .from('informes')
        .select('*')
        .eq('id', params.id)
        .single()
      setInforme(data)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!informe) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-700">Informe no encontrado</h2>
        <Link href="/informes" className="text-blue-500 text-sm mt-2 inline-block">Volver a informes</Link>
      </div>
    )
  }

  const municipio = process.env.NEXT_PUBLIC_MUNICIPIO_NOMBRE || 'Llanes'
  const periodo = `${format(new Date(informe.periodo_inicio), 'MMMM yyyy', { locale: es })}`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/informes" className="p-2 rounded-xl bg-white/60 backdrop-blur-xl border border-white/30 hover:bg-white/80 transition">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Informe {periodo}</h1>
            <p className="text-sm text-gray-500">
              {format(new Date(informe.periodo_inicio), 'd MMM', { locale: es })} — {format(new Date(informe.periodo_fin), 'd MMM yyyy', { locale: es })}
            </p>
          </div>
        </div>

        {informe.narrativa_ia && (
          <PDFDownloadLink
            document={<InformePDF narrativa={informe.narrativa_ia} municipio={municipio} periodo={periodo} />}
            fileName={`informe-${municipio.toLowerCase()}-${format(new Date(informe.periodo_inicio), 'yyyy-MM')}.pdf`}
          >
            {({ loading: pdfLoading }) => (
              <button
                disabled={pdfLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 transition disabled:opacity-50"
              >
                {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Descargar PDF
              </button>
            )}
          </PDFDownloadLink>
        )}
      </div>

      {/* KPI snapshot */}
      {informe.datos_snapshot && Object.keys(informe.datos_snapshot).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(informe.datos_snapshot).slice(0, 8).map(([key, val]) => (
            <div key={key} className="bg-white/60 backdrop-blur-xl rounded-xl border border-white/30 p-4">
              <p className="text-xs text-gray-500 capitalize">{key.replace(/_/g, ' ')}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{Number(val).toLocaleString('es-ES')}</p>
            </div>
          ))}
        </div>
      )}

      {informe.narrativa_ia && (
        <InformePreview narrativa={informe.narrativa_ia} municipio={municipio} periodo={periodo} />
      )}
    </div>
  )
}
