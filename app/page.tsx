'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Eye, Headphones, Smartphone, QrCode } from 'lucide-react'
import KPICard from '@/components/KPICard'
import TrendChart from '@/components/TrendChart'
import BarRanking from '@/components/BarRanking'
import { createClient } from '@/lib/supabase/client'
import { getKPIs, getSeriesDiarias, getIdiomasDistribucion } from '@/lib/metricas'
import { getMockKPIs, getMockSeries, getMockIdiomas } from '@/lib/mock-data'

const MUNICIPIO_ID = process.env.NEXT_PUBLIC_MUNICIPIO_ID || '550e8400-e29b-41d4-a716-446655440000'

const KPI_CONFIG = [
  { metrica: 'tour_views', titulo: 'Visitas Tours 30d', icon: Eye, color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
  { metrica: 'audio_plays', titulo: 'Audios Reproducidos', icon: Headphones, color: 'bg-gradient-to-br from-emerald-500 to-emerald-600' },
  { metrica: 'pwa_installs', titulo: 'Instalaciones PWA', icon: Smartphone, color: 'bg-gradient-to-br from-violet-500 to-violet-600' },
  { metrica: 'qr_scans', titulo: 'Escaneos QR', icon: QrCode, color: 'bg-gradient-to-br from-amber-500 to-amber-600' },
]

const CHART_LINES = [
  { key: 'tour_views', color: '#3b82f6', label: 'Tours' },
  { key: 'audio_plays', color: '#10b981', label: 'Audios' },
  { key: 'qr_scans', color: '#f59e0b', label: 'QR' },
  { key: 'page_views', color: '#8b5cf6', label: 'Páginas' },
]

export default function DashboardPage() {
  const [kpis, setKpis] = useState<Array<{ metrica: string; valor: number; delta: number }>>([])
  const [series, setSeries] = useState<Array<Record<string, unknown>>>([])
  const [idiomas, setIdiomas] = useState<Array<{ idioma: string; valor: number }>>([])
  const [loading, setLoading] = useState(true)
  const [demoMode, setDemoMode] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const [k, s, i] = await Promise.all([
        getKPIs(supabase, MUNICIPIO_ID),
        getSeriesDiarias(supabase, MUNICIPIO_ID, 30),
        getIdiomasDistribucion(supabase, MUNICIPIO_ID),
      ])
      const totalVisitas = k.find(x => x.metrica === 'tour_views')?.valor || 0
      if (totalVisitas > 0) {
        setKpis(k)
        setSeries(s)
        setIdiomas(i)
        setDemoMode(false)
      } else {
        loadMockData()
      }
    } catch {
      loadMockData()
    }
    setLoading(false)
  }

  const loadMockData = () => {
    setKpis(getMockKPIs())
    setSeries(getMockSeries(30))
    setIdiomas(getMockIdiomas())
    setDemoMode(true)
  }

  useEffect(() => { loadData() }, [])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Resumen de los últimos 30 días</p>
        </div>
        {demoMode && (
          <span className="px-4 py-2 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
            MODO DEMO — Datos simulados de Llanes
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {KPI_CONFIG.map(cfg => {
              const kpi = kpis.find(k => k.metrica === cfg.metrica)
              return (
                <KPICard
                  key={cfg.metrica}
                  titulo={cfg.titulo}
                  valor={kpi?.valor || 0}
                  delta={kpi?.delta || 0}
                  icon={cfg.icon}
                  color={cfg.color}
                />
              )
            })}
          </div>

          <TrendChart data={series} lines={CHART_LINES} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarRanking data={idiomas} titulo="Top 5 idiomas (Tours 30d)" />
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/30 p-6 shadow-lg shadow-black/5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen rápido</h3>
              <div className="space-y-4">
                {kpis.map(k => (
                  <div key={k.metrica} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-600">
                      {KPI_CONFIG.find(c => c.metrica === k.metrica)?.titulo || k.metrica}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900">{k.valor.toLocaleString('es-ES')}</span>
                      <span className={`text-xs font-medium ${k.delta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {k.delta >= 0 ? '+' : ''}{k.delta.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
