import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { detectarAlertas } from '@/lib/alertas'

const MUNICIPIO_ID = process.env.MUNICIPIO_ID || '550e8400-e29b-41d4-a716-446655440000'

export async function GET() {
  try {
    const supabase = createServiceClient()
    const alertas = await detectarAlertas(supabase, MUNICIPIO_ID)
    return NextResponse.json(alertas)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
