import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/** GET /api/conciliacao/lancamentos?empresa_id=...&mes=YYYY-MM */
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const empresaId = req.nextUrl.searchParams.get('empresa_id')
  const mes       = req.nextUrl.searchParams.get('mes') // 'YYYY-MM'

  if (!empresaId || !mes) {
    return NextResponse.json({ error: 'empresa_id e mes são obrigatórios' }, { status: 400 })
  }

  const dataInicio = `${mes}-01`
  const dataFim    = new Date(Number(mes.slice(0, 4)), Number(mes.slice(5, 7)), 0)
    .toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('lancamentos')
    .select('*')
    .eq('empresa_id', empresaId)
    .gte('data', dataInicio)
    .lte('data', dataFim)
    .order('data', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
