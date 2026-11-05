import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/** GET /api/conciliacao/extrato?empresa_id=...&conta_id=...&mes=YYYY-MM */
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const empresaId = req.nextUrl.searchParams.get('empresa_id')
  const contaId   = req.nextUrl.searchParams.get('conta_id')
  const mes       = req.nextUrl.searchParams.get('mes') // 'YYYY-MM'

  if (!empresaId || !contaId || !mes) {
    return NextResponse.json({ error: 'empresa_id, conta_id e mes são obrigatórios' }, { status: 400 })
  }

  const dataInicio = `${mes}-01`
  const dataFim    = new Date(Number(mes.slice(0, 4)), Number(mes.slice(5, 7)), 0)
    .toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('extrato_itens')
    .select('*')
    .eq('empresa_id', empresaId)
    .eq('conta_id', contaId)
    .gte('data', dataInicio)
    .lte('data', dataFim)
    .order('data', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
