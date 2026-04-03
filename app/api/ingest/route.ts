import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { municipio_id, fecha, fuente, metrica, valor, metadata } = body

    if (!municipio_id || !fecha || !fuente || !metrica || valor === undefined) {
      return NextResponse.json({ error: 'Campos requeridos: municipio_id, fecha, fuente, metrica, valor' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('metricas_diarias')
      .upsert({
        municipio_id,
        fecha,
        fuente,
        metrica,
        valor,
        metadata: metadata || {},
      }, { onConflict: 'municipio_id,fecha,fuente,metrica' })
      .select()

    if (error) throw error
    return NextResponse.json({ ok: true, data })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
