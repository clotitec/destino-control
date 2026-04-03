import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getMetricasRango } from '@/lib/metricas'

const MUNICIPIO_ID = process.env.MUNICIPIO_ID || '550e8400-e29b-41d4-a716-446655440000'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const inicio = searchParams.get('inicio')
  const fin = searchParams.get('fin')
  const metrica = searchParams.get('metrica') || undefined

  if (!inicio || !fin) {
    return NextResponse.json({ error: 'Parámetros inicio y fin requeridos' }, { status: 400 })
  }

  try {
    const supabase = createServiceClient()
    const data = await getMetricasRango(supabase, MUNICIPIO_ID, inicio, fin, metrica)
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
