import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/** GET /api/conciliacao/contas?empresa_id=... */
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const empresaId = req.nextUrl.searchParams.get('empresa_id')
  if (!empresaId) return NextResponse.json({ error: 'empresa_id obrigatório' }, { status: 400 })

  const { data, error } = await supabase
    .from('extrato_contas')
    .select('*')
    .eq('empresa_id', empresaId)
    .eq('ativo', true)
    .order('banco')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

/** POST /api/conciliacao/contas — cria nova conta bancária */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { empresa_id, nome, banco, agencia, conta } = await req.json()
  if (!empresa_id || !nome || !banco) {
    return NextResponse.json({ error: 'empresa_id, nome e banco são obrigatórios' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('extrato_contas')
    .insert({ empresa_id, nome, banco, agencia, conta })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
