import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  }

  try {
    const supabase = createServiceClient()
    const { data: informe, error } = await supabase
      .from('informes')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !informe) {
      return NextResponse.json({ error: 'Informe no encontrado' }, { status: 404 })
    }

    // Return informe data for client-side PDF generation
    return NextResponse.json(informe)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
