'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getKPIs } from '@/lib/metricas'
import { Eye, Headphones, QrCode, BarChart3 } from 'lucide-react'

const MUNICIPIO_ID = process.env.NEXT_PUBLIC_MUNICIPIO_ID || '550e8400-e29b-41d4-a716-446655440000'

type KPI = { metrica: string; valor: number; delta: number }

const CONFIG = [
  { metrica: 'tour_views', label: 'Tours', icon: Eye, color: '#3b82f6' },
  { metrica: 'audio_plays', label: 'Audios', icon: Headphones, color: '#10b981' },
  { metrica: 'qr_scans', label: 'QR Scans', icon: QrCode, color: '#f59e0b' },
]

export default function WidgetEmbed() {
  const [kpis, setKpis] = useState<KPI[]>([])
  const supabase = createClient()

  useEffect(() => {
    getKPIs(supabase, MUNICIPIO_ID).then(setKpis).catch(console.error)
  }, [])

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      background: 'rgba(255,255,255,0.8)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.3)',
      padding: '20px',
      maxWidth: '360px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <BarChart3 style={{ width: 18, height: 18, color: '#3b82f6' }} />
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937' }}>Destino Control</span>
        <span style={{ fontSize: '10px', color: '#9ca3af', marginLeft: 'auto' }}>30 días</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {CONFIG.map(cfg => {
          const kpi = kpis.find(k => k.metrica === cfg.metrica)
          const Icon = cfg.icon
          return (
            <div key={cfg.metrica} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: cfg.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon style={{ width: 18, height: 18, color: cfg.color }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>{cfg.label}</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
                  {(kpi?.valor || 0).toLocaleString('es-ES')}
                </div>
              </div>
              <span style={{
                fontSize: '12px', fontWeight: 600,
                color: (kpi?.delta || 0) >= 0 ? '#059669' : '#dc2626'
              }}>
                {(kpi?.delta || 0) >= 0 ? '+' : ''}{(kpi?.delta || 0).toFixed(1)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
