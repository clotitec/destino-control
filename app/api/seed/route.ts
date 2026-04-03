import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { seedMetricas } from '@/lib/seed'

export async function POST() {
  try {
    const supabase = createServiceClient()
    const result = await seedMetricas(supabase, 90)
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}
