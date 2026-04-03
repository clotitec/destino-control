import { SupabaseClient } from '@supabase/supabase-js'
import { format, subDays } from 'date-fns'

const UMBRAL_DELTA = 20 // porcentaje

const METRICA_LABELS: Record<string, string> = {
  tour_views: 'Visitas a tours',
  audio_plays: 'Reproducciones de audio',
  pwa_installs: 'Instalaciones PWA',
  qr_scans: 'Escaneos QR',
  page_views: 'Páginas vistas',
  gpx_downloads: 'Descargas GPX',
  resenas: 'Reseñas',
  checkins: 'Check-ins',
}

export async function detectarAlertas(supabase: SupabaseClient, municipioId: string) {
  const hoy = new Date()
  const hace7 = format(subDays(hoy, 7), 'yyyy-MM-dd')
  const hace14 = format(subDays(hoy, 14), 'yyyy-MM-dd')
  const hoyStr = format(hoy, 'yyyy-MM-dd')

  const { data: semanaActual } = await supabase
    .from('metricas_diarias')
    .select('metrica, valor')
    .eq('municipio_id', municipioId)
    .gte('fecha', hace7)
    .lte('fecha', hoyStr)

  const { data: semanaAnterior } = await supabase
    .from('metricas_diarias')
    .select('metrica, valor')
    .eq('municipio_id', municipioId)
    .gte('fecha', hace14)
    .lt('fecha', hace7)

  if (!semanaActual || !semanaAnterior) return []

  const sumar = (rows: Array<{ metrica: string; valor: number }>, m: string) =>
    rows.filter(r => r.metrica === m).reduce((s, r) => s + Number(r.valor), 0)

  const metricas = Object.keys(METRICA_LABELS)
  const alertas: Array<{
    municipio_id: string
    tipo: string
    metrica: string
    valor_actual: number
    valor_anterior: number
    delta_pct: number
    mensaje: string
  }> = []

  for (const m of metricas) {
    const actual = sumar(semanaActual, m)
    const anterior = sumar(semanaAnterior, m)
    if (anterior === 0) continue

    const delta = ((actual - anterior) / anterior) * 100

    if (Math.abs(delta) >= UMBRAL_DELTA) {
      const tipo = delta > 0 ? 'subida' : 'bajada'
      const label = METRICA_LABELS[m]
      const signo = delta > 0 ? '+' : ''
      alertas.push({
        municipio_id: municipioId,
        tipo,
        metrica: m,
        valor_actual: actual,
        valor_anterior: anterior,
        delta_pct: Math.round(delta * 10) / 10,
        mensaje: `${label}: ${signo}${Math.round(delta)}% esta semana (${actual} vs ${anterior})`,
      })
    }
  }

  return alertas
}
