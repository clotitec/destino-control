import { SupabaseClient } from '@supabase/supabase-js'
import { format, subDays, getDay } from 'date-fns'

const MUNICIPIO_ID = process.env.MUNICIPIO_ID || '550e8400-e29b-41d4-a716-446655440000'

const IDIOMAS_DIST = { es: 0.45, en: 0.25, fr: 0.15, de: 0.10, otros: 0.05 }

const POIS = [
  'Playa de Torimbia', 'Paseo de San Pedro', 'Casco Histórico',
  'Bufones de Pría', 'Playa de Gulpiyuri', 'Cueva del Pindal',
  'Sierra del Cuera', 'Puerto de Llanes', 'Playa de Ballota', 'Iglesia de Santa María'
]

const POI_WEIGHTS = [0.18, 0.15, 0.12, 0.10, 0.08, 0.07, 0.06, 0.06, 0.05, 0.04]

type MetricaBase = { base: [number, number]; fuente: string }

const METRICAS: Record<string, MetricaBase> = {
  tour_views:    { base: [80, 150],  fuente: 'municipio360' },
  audio_plays:   { base: [30, 60],   fuente: 'elevenlabs' },
  page_views:    { base: [200, 400], fuente: 'ga4' },
  pwa_installs:  { base: [2, 5],     fuente: 'ga4' },
  qr_scans:      { base: [10, 25],   fuente: 'municipio360' },
  gpx_downloads: { base: [5, 15],    fuente: 'municipio360' },
  resenas:       { base: [1, 4],     fuente: 'google_business' },
  checkins:      { base: [3, 8],     fuente: 'social' },
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function distribuirPorIdioma(total: number) {
  const result: Record<string, number> = {}
  let restante = total
  const entries = Object.entries(IDIOMAS_DIST)
  entries.forEach(([lang, pct], i) => {
    if (i === entries.length - 1) {
      result[lang] = restante
    } else {
      const val = Math.round(total * pct * (0.8 + Math.random() * 0.4))
      result[lang] = Math.min(val, restante)
      restante -= result[lang]
    }
  })
  return result
}

function distribuirPorPoi(total: number) {
  const result: Record<string, number> = {}
  let restante = total
  POIS.forEach((poi, i) => {
    if (i === POIS.length - 1) {
      result[poi] = restante
    } else {
      const weight = POI_WEIGHTS[i] || 0.03
      const val = Math.round(total * weight * (0.7 + Math.random() * 0.6))
      result[poi] = Math.min(val, restante)
      restante -= result[poi]
    }
  })
  return result
}

export async function seedMetricas(supabase: SupabaseClient, dias: number = 90) {
  const hoy = new Date()
  const rows: Array<{
    municipio_id: string
    fecha: string
    fuente: string
    metrica: string
    valor: number
    metadata: Record<string, unknown>
  }> = []

  for (let d = 0; d < dias; d++) {
    const fecha = subDays(hoy, d)
    const fechaStr = format(fecha, 'yyyy-MM-dd')
    const diaSemana = getDay(fecha)
    const esFinDeSemana = diaSemana === 0 || diaSemana === 6
    const mesOffset = Math.floor(d / 30)
    const tendenciaMes = Math.pow(0.95, mesOffset) // más reciente = más alto

    for (const [metrica, config] of Object.entries(METRICAS)) {
      let valor = rand(config.base[0], config.base[1])
      if (esFinDeSemana) valor = Math.round(valor * 1.4)
      valor = Math.round(valor * tendenciaMes)
      valor = Math.round(valor * (0.8 + Math.random() * 0.4))
      valor = Math.max(0, valor)

      const metadata: Record<string, unknown> = {}
      if (metrica === 'tour_views' || metrica === 'audio_plays') {
        metadata.por_idioma = distribuirPorIdioma(valor)
      }
      if (metrica === 'tour_views' || metrica === 'qr_scans') {
        metadata.por_poi = distribuirPorPoi(valor)
      }

      rows.push({
        municipio_id: MUNICIPIO_ID,
        fecha: fechaStr,
        fuente: config.fuente,
        metrica,
        valor,
        metadata,
      })
    }
  }

  // Insert in batches of 200
  const batchSize = 200
  let inserted = 0
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    const { error } = await supabase
      .from('metricas_diarias')
      .upsert(batch, { onConflict: 'municipio_id,fecha,fuente,metrica' })
    if (error) {
      console.error('Seed error batch', i, error)
    } else {
      inserted += batch.length
    }
  }

  return { inserted, total: rows.length }
}
