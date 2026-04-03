import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getMetricasRango } from '@/lib/metricas'
import { generarInformeIA } from '@/lib/claude'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'

const MUNICIPIO_ID = process.env.MUNICIPIO_ID || '550e8400-e29b-41d4-a716-446655440000'
const MUNICIPIO_NOMBRE = process.env.MUNICIPIO_NOMBRE || 'Llanes'
const MUNICIPIO_PROVINCIA = process.env.MUNICIPIO_PROVINCIA || 'Asturias'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const mesRef = body.mes ? new Date(body.mes) : subMonths(new Date(), 1)

    const inicio = format(startOfMonth(mesRef), 'yyyy-MM-dd')
    const fin = format(endOfMonth(mesRef), 'yyyy-MM-dd')
    const periodo = format(mesRef, 'MMMM yyyy', { locale: es })

    const supabase = createServiceClient()
    const metricas = await getMetricasRango(supabase, MUNICIPIO_ID, inicio, fin)

    // Agregar métricas
    const resumen: Record<string, number> = {}
    metricas.forEach(m => {
      resumen[m.metrica] = (resumen[m.metrica] || 0) + Number(m.valor)
    })

    const narrativa = await generarInformeIA(MUNICIPIO_NOMBRE, MUNICIPIO_PROVINCIA, periodo, resumen)

    // Guardar informe
    const { data: informe, error } = await supabase
      .from('informes')
      .insert({
        municipio_id: MUNICIPIO_ID,
        periodo_inicio: inicio,
        periodo_fin: fin,
        tipo: 'mensual',
        datos_snapshot: resumen,
        narrativa_ia: narrativa,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ ok: true, informe })
  } catch (error) {
    console.error('Error generando informe:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
