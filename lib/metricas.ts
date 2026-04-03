import { SupabaseClient } from '@supabase/supabase-js'
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns'

export type MetricaRow = {
  id: number
  municipio_id: string
  fecha: string
  fuente: string
  metrica: string
  valor: number
  metadata: Record<string, unknown>
}

export async function getMetricasRango(
  supabase: SupabaseClient,
  municipioId: string,
  fechaInicio: string,
  fechaFin: string,
  metrica?: string
) {
  let query = supabase
    .from('metricas_diarias')
    .select('*')
    .eq('municipio_id', municipioId)
    .gte('fecha', fechaInicio)
    .lte('fecha', fechaFin)
    .order('fecha', { ascending: true })

  if (metrica) {
    query = query.eq('metrica', metrica)
  }

  const { data, error } = await query
  if (error) throw error
  return data as MetricaRow[]
}

export async function getKPIs(supabase: SupabaseClient, municipioId: string) {
  const hoy = new Date()
  const hace30 = subDays(hoy, 30)
  const hace60 = subDays(hoy, 60)

  const fechaFin = format(hoy, 'yyyy-MM-dd')
  const fechaInicio30 = format(hace30, 'yyyy-MM-dd')
  const fechaInicio60 = format(hace60, 'yyyy-MM-dd')

  const [actual, anterior] = await Promise.all([
    getMetricasRango(supabase, municipioId, fechaInicio30, fechaFin),
    getMetricasRango(supabase, municipioId, fechaInicio60, fechaInicio30),
  ])

  const sumar = (rows: MetricaRow[], m: string) =>
    rows.filter(r => r.metrica === m).reduce((s, r) => s + Number(r.valor), 0)

  const metricas = ['tour_views', 'audio_plays', 'pwa_installs', 'qr_scans'] as const

  return metricas.map(m => {
    const valorActual = sumar(actual, m)
    const valorAnterior = sumar(anterior, m)
    const delta = valorAnterior > 0 ? ((valorActual - valorAnterior) / valorAnterior) * 100 : 0
    return { metrica: m, valor: valorActual, valorAnterior, delta }
  })
}

export async function getSeriesDiarias(
  supabase: SupabaseClient,
  municipioId: string,
  dias: number = 30
) {
  const hoy = new Date()
  const inicio = format(subDays(hoy, dias), 'yyyy-MM-dd')
  const fin = format(hoy, 'yyyy-MM-dd')

  const data = await getMetricasRango(supabase, municipioId, inicio, fin)

  const porDia: Record<string, Record<string, number>> = {}
  data.forEach(row => {
    if (!porDia[row.fecha]) porDia[row.fecha] = {}
    porDia[row.fecha][row.metrica] = (porDia[row.fecha][row.metrica] || 0) + Number(row.valor)
  })

  return Object.entries(porDia)
    .map(([fecha, metricas]) => ({ fecha, ...metricas }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
}

export async function getIdiomasDistribucion(
  supabase: SupabaseClient,
  municipioId: string
) {
  const hoy = new Date()
  const inicio = format(subDays(hoy, 30), 'yyyy-MM-dd')
  const fin = format(hoy, 'yyyy-MM-dd')

  const data = await getMetricasRango(supabase, municipioId, inicio, fin, 'tour_views')

  const idiomas: Record<string, number> = {}
  data.forEach(row => {
    const porIdioma = (row.metadata as { por_idioma?: Record<string, number> })?.por_idioma
    if (porIdioma) {
      Object.entries(porIdioma).forEach(([lang, val]) => {
        idiomas[lang] = (idiomas[lang] || 0) + val
      })
    }
  })

  return Object.entries(idiomas)
    .map(([idioma, valor]) => ({ idioma, valor }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5)
}

export async function getMetricasMesComparar(
  supabase: SupabaseClient,
  municipioId: string,
  mes: Date
) {
  const inicioActual = format(startOfMonth(mes), 'yyyy-MM-dd')
  const finActual = format(endOfMonth(mes), 'yyyy-MM-dd')
  const mesAnterior = subMonths(mes, 1)
  const inicioAnterior = format(startOfMonth(mesAnterior), 'yyyy-MM-dd')
  const finAnterior = format(endOfMonth(mesAnterior), 'yyyy-MM-dd')

  const [actual, anterior] = await Promise.all([
    getMetricasRango(supabase, municipioId, inicioActual, finActual),
    getMetricasRango(supabase, municipioId, inicioAnterior, finAnterior),
  ])

  return { actual, anterior, inicioActual, finActual, inicioAnterior, finAnterior }
}
