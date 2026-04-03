import { format, subDays, getDay } from 'date-fns'

const MUNICIPIO_ID = '550e8400-e29b-41d4-a716-446655440000'

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

// Seeded random for consistency
let _seed = 42
function seededRandom() {
  _seed = (_seed * 16807 + 0) % 2147483647
  return (_seed - 1) / 2147483646
}

function rand(min: number, max: number) {
  return Math.floor(seededRandom() * (max - min + 1)) + min
}

function distribuirPorIdioma(total: number) {
  const result: Record<string, number> = {}
  let restante = total
  const entries = Object.entries(IDIOMAS_DIST)
  entries.forEach(([lang, pct], i) => {
    if (i === entries.length - 1) {
      result[lang] = Math.max(0, restante)
    } else {
      const val = Math.round(total * pct * (0.8 + seededRandom() * 0.4))
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
      result[poi] = Math.max(0, restante)
    } else {
      const weight = POI_WEIGHTS[i] || 0.03
      const val = Math.round(total * weight * (0.7 + seededRandom() * 0.6))
      result[poi] = Math.min(val, restante)
      restante -= result[poi]
    }
  })
  return result
}

export type MockMetrica = {
  id: number
  municipio_id: string
  fecha: string
  fuente: string
  metrica: string
  valor: number
  metadata: Record<string, unknown>
}

let _mockData: MockMetrica[] | null = null

export function getMockData(): MockMetrica[] {
  if (_mockData) return _mockData

  _seed = 42 // reset for consistency
  const hoy = new Date()
  const rows: MockMetrica[] = []
  let id = 1

  for (let d = 0; d < 90; d++) {
    const fecha = subDays(hoy, d)
    const fechaStr = format(fecha, 'yyyy-MM-dd')
    const diaSemana = getDay(fecha)
    const esFinDeSemana = diaSemana === 0 || diaSemana === 6
    const mesOffset = Math.floor(d / 30)
    const tendenciaMes = Math.pow(0.95, mesOffset)

    for (const [metrica, config] of Object.entries(METRICAS)) {
      let valor = rand(config.base[0], config.base[1])
      if (esFinDeSemana) valor = Math.round(valor * 1.4)
      valor = Math.round(valor * tendenciaMes)
      valor = Math.round(valor * (0.8 + seededRandom() * 0.4))
      valor = Math.max(0, valor)

      const metadata: Record<string, unknown> = {}
      if (metrica === 'tour_views' || metrica === 'audio_plays') {
        metadata.por_idioma = distribuirPorIdioma(valor)
      }
      if (metrica === 'tour_views' || metrica === 'qr_scans') {
        metadata.por_poi = distribuirPorPoi(valor)
      }

      rows.push({ id: id++, municipio_id: MUNICIPIO_ID, fecha: fechaStr, fuente: config.fuente, metrica, valor, metadata })
    }
  }

  _mockData = rows
  return rows
}

// Mock KPIs
export function getMockKPIs() {
  const data = getMockData()
  const hoy = new Date()
  const hace30 = format(subDays(hoy, 30), 'yyyy-MM-dd')
  const hace60 = format(subDays(hoy, 60), 'yyyy-MM-dd')
  const hoyStr = format(hoy, 'yyyy-MM-dd')

  const actual = data.filter(r => r.fecha >= hace30 && r.fecha <= hoyStr)
  const anterior = data.filter(r => r.fecha >= hace60 && r.fecha < hace30)

  const sumar = (rows: MockMetrica[], m: string) =>
    rows.filter(r => r.metrica === m).reduce((s, r) => s + r.valor, 0)

  return ['tour_views', 'audio_plays', 'pwa_installs', 'qr_scans'].map(m => {
    const valorActual = sumar(actual, m)
    const valorAnterior = sumar(anterior, m)
    const delta = valorAnterior > 0 ? ((valorActual - valorAnterior) / valorAnterior) * 100 : 0
    return { metrica: m, valor: valorActual, valorAnterior, delta }
  })
}

// Mock series diarias
export function getMockSeries(dias: number = 30) {
  const data = getMockData()
  const hoy = new Date()
  const inicio = format(subDays(hoy, dias), 'yyyy-MM-dd')
  const hoyStr = format(hoy, 'yyyy-MM-dd')

  const filtered = data.filter(r => r.fecha >= inicio && r.fecha <= hoyStr)
  const porDia: Record<string, Record<string, number>> = {}
  filtered.forEach(row => {
    if (!porDia[row.fecha]) porDia[row.fecha] = {}
    porDia[row.fecha][row.metrica] = (porDia[row.fecha][row.metrica] || 0) + row.valor
  })

  return Object.entries(porDia)
    .map(([fecha, metricas]) => ({ fecha, ...metricas }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
}

// Mock idiomas
export function getMockIdiomas() {
  const data = getMockData()
  const hoy = new Date()
  const inicio = format(subDays(hoy, 30), 'yyyy-MM-dd')

  const idiomas: Record<string, number> = {}
  data.filter(r => r.metrica === 'tour_views' && r.fecha >= inicio).forEach(row => {
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

// Mock comparativa
export function getMockComparativa(mesStr: string) {
  const data = getMockData()
  const mes = new Date(mesStr + '-01')
  const { startOfMonth, endOfMonth, subMonths } = require('date-fns')
  const inicioActual = format(startOfMonth(mes), 'yyyy-MM-dd')
  const finActual = format(endOfMonth(mes), 'yyyy-MM-dd')
  const mesAnt = subMonths(mes, 1)
  const inicioAnt = format(startOfMonth(mesAnt), 'yyyy-MM-dd')
  const finAnt = format(endOfMonth(mesAnt), 'yyyy-MM-dd')

  const actual = data.filter(r => r.fecha >= inicioActual && r.fecha <= finActual)
  const anterior = data.filter(r => r.fecha >= inicioAnt && r.fecha <= finAnt)
  return { actual, anterior }
}

// Mock alertas
export function getMockAlertas() {
  const data = getMockData()
  const hoy = new Date()
  const hace7 = format(subDays(hoy, 7), 'yyyy-MM-dd')
  const hace14 = format(subDays(hoy, 14), 'yyyy-MM-dd')
  const hoyStr = format(hoy, 'yyyy-MM-dd')

  const semActual = data.filter(r => r.fecha >= hace7 && r.fecha <= hoyStr)
  const semAnterior = data.filter(r => r.fecha >= hace14 && r.fecha < hace7)

  const LABELS: Record<string, string> = {
    tour_views: 'Visitas a tours', audio_plays: 'Reproducciones de audio',
    pwa_installs: 'Instalaciones PWA', qr_scans: 'Escaneos QR',
    page_views: 'Páginas vistas', gpx_downloads: 'Descargas GPX',
    resenas: 'Reseñas', checkins: 'Check-ins',
  }

  const sumar = (rows: MockMetrica[], m: string) =>
    rows.filter(r => r.metrica === m).reduce((s, r) => s + r.valor, 0)

  const alertas: Array<{ tipo: string; metrica: string; valor_actual: number; valor_anterior: number; delta_pct: number; mensaje: string }> = []

  for (const [m, label] of Object.entries(LABELS)) {
    const actual = sumar(semActual, m)
    const anterior = sumar(semAnterior, m)
    if (anterior === 0) continue
    const delta = ((actual - anterior) / anterior) * 100
    if (Math.abs(delta) >= 15) { // Lower threshold for demo
      const tipo = delta > 0 ? 'subida' : 'bajada'
      alertas.push({
        tipo, metrica: m, valor_actual: actual, valor_anterior: anterior,
        delta_pct: Math.round(delta * 10) / 10,
        mensaje: `${label}: ${delta > 0 ? '+' : ''}${Math.round(delta)}% esta semana (${actual} vs ${anterior})`,
      })
    }
  }
  return alertas
}
