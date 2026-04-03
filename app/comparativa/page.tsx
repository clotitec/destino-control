'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { CalendarDays } from 'lucide-react'
import CompareCard from '@/components/CompareCard'
import { createClient } from '@/lib/supabase/client'
import { getMetricasRango, MetricaRow } from '@/lib/metricas'
import { getMockComparativa, MockMetrica } from '@/lib/mock-data'
import { ResponsiveContainer, LineChart, Line } from 'recharts'

const MUNICIPIO_ID = process.env.NEXT_PUBLIC_MUNICIPIO_ID || '550e8400-e29b-41d4-a716-446655440000'

const METRICA_LABELS: Record<string, string> = {
  tour_views: 'Visitas a tours',
  audio_plays: 'Reproducciones de audio',
  page_views: 'Páginas vistas',
  pwa_installs: 'Instalaciones PWA',
  qr_scans: 'Escaneos QR',
  gpx_downloads: 'Descargas GPX',
  resenas: 'Reseñas',
  checkins: 'Check-ins',
}

type POIRanking = { poi: string; actual: number; anterior: number; sparkline: number[] }

function processData(actual: Array<MetricaRow | MockMetrica>, anterior: Array<MetricaRow | MockMetrica>) {
  const sumar = (rows: Array<MetricaRow | MockMetrica>, m: string) =>
    rows.filter(r => r.metrica === m).reduce((s, r) => s + Number(r.valor), 0)

  const comps = Object.entries(METRICA_LABELS).map(([key, label]) => ({
    titulo: label, actual: sumar(actual, key), anterior: sumar(anterior, key),
  }))

  const poiMap: Record<string, { actual: number; anterior: number; daily: Record<string, number> }> = {}
  const processPOIs = (rows: Array<MetricaRow | MockMetrica>, field: 'actual' | 'anterior') => {
    rows.filter(r => r.metrica === 'tour_views').forEach(row => {
      const porPoi = (row.metadata as { por_poi?: Record<string, number> })?.por_poi
      if (porPoi) {
        Object.entries(porPoi).forEach(([poi, val]) => {
          if (!poiMap[poi]) poiMap[poi] = { actual: 0, anterior: 0, daily: {} }
          poiMap[poi][field] += val
          if (field === 'actual') poiMap[poi].daily[row.fecha] = (poiMap[poi].daily[row.fecha] || 0) + val
        })
      }
    })
  }
  processPOIs(actual, 'actual')
  processPOIs(anterior, 'anterior')

  const ranking = Object.entries(poiMap)
    .map(([poi, data]) => ({ poi, actual: data.actual, anterior: data.anterior, sparkline: Object.values(data.daily).slice(-14) }))
    .sort((a, b) => b.actual - a.actual).slice(0, 10)

  return { comps, ranking }
}

export default function ComparativaPage() {
  const [mesActual, setMesActual] = useState(() => format(subMonths(new Date(), 1), 'yyyy-MM'))
  const [comparaciones, setComparaciones] = useState<Array<{ titulo: string; actual: number; anterior: number }>>([])
  const [poiRanking, setPoiRanking] = useState<POIRanking[]>([])
  const [loading, setLoading] = useState(true)
  const [demoMode, setDemoMode] = useState(false)

  useEffect(() => { loadComparativa() }, [mesActual])

  const loadComparativa = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const mes = new Date(mesActual + '-01')
      const mesAnt = subMonths(mes, 1)
      const [actual, anterior] = await Promise.all([
        getMetricasRango(supabase, MUNICIPIO_ID, format(startOfMonth(mes), 'yyyy-MM-dd'), format(endOfMonth(mes), 'yyyy-MM-dd')),
        getMetricasRango(supabase, MUNICIPIO_ID, format(startOfMonth(mesAnt), 'yyyy-MM-dd'), format(endOfMonth(mesAnt), 'yyyy-MM-dd')),
      ])
      if (actual.length > 0) {
        const { comps, ranking } = processData(actual, anterior)
        setComparaciones(comps)
        setPoiRanking(ranking)
        setDemoMode(false)
      } else {
        loadMock()
      }
    } catch {
      loadMock()
    }
    setLoading(false)
  }

  const loadMock = () => {
    const { actual, anterior } = getMockComparativa(mesActual)
    const { comps, ranking } = processData(actual, anterior)
    setComparaciones(comps)
    setPoiRanking(ranking)
    setDemoMode(true)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Comparativa</h1>
          <p className="text-gray-500 mt-1">Mes actual vs mes anterior</p>
        </div>
        <div className="flex items-center gap-3">
          {demoMode && <span className="px-3 py-1.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">DEMO</span>}
          <div className="flex items-center gap-3 bg-white/60 backdrop-blur-xl rounded-xl border border-white/30 px-4 py-2">
            <CalendarDays className="w-4 h-4 text-gray-400" />
            <input type="month" value={mesActual} onChange={e => setMesActual(e.target.value)} className="bg-transparent text-sm text-gray-700 outline-none" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {comparaciones.slice(0, 4).map(c => (
              <CompareCard key={c.titulo} titulo={c.titulo} valorActual={c.actual} valorAnterior={c.anterior} />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {comparaciones.slice(4).map(c => (
              <CompareCard key={c.titulo} titulo={c.titulo} valorActual={c.actual} valorAnterior={c.anterior} />
            ))}
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/30 p-6 shadow-lg shadow-black/5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ranking de Puntos de Interés</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">#</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">POI</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase py-3 px-2">Actual</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase py-3 px-2">Anterior</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase py-3 px-2">Variación</th>
                    <th className="text-center text-xs font-medium text-gray-500 uppercase py-3 px-2">Tendencia</th>
                  </tr>
                </thead>
                <tbody>
                  {poiRanking.map((poi, i) => {
                    const delta = poi.anterior > 0 ? ((poi.actual - poi.anterior) / poi.anterior * 100) : 0
                    return (
                      <tr key={poi.poi} className="border-b border-gray-50 hover:bg-white/40 transition">
                        <td className="py-3 px-2 text-sm text-gray-400">{i + 1}</td>
                        <td className="py-3 px-2 text-sm font-medium text-gray-900">{poi.poi}</td>
                        <td className="py-3 px-2 text-sm text-right font-semibold text-gray-900">{poi.actual.toLocaleString('es-ES')}</td>
                        <td className="py-3 px-2 text-sm text-right text-gray-500">{poi.anterior.toLocaleString('es-ES')}</td>
                        <td className={`py-3 px-2 text-sm text-right font-medium ${delta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
                        </td>
                        <td className="py-3 px-2">
                          <div className="w-24 h-8 mx-auto">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={poi.sparkline.map((v, j) => ({ i: j, v }))}>
                                <Line type="monotone" dataKey="v" stroke={delta >= 0 ? '#10b981' : '#ef4444'} strokeWidth={1.5} dot={false} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
