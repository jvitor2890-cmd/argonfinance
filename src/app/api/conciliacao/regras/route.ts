import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/** GET /api/conciliacao/regras?empresa_id=... */
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const empresaId = req.nextUrl.searchParams.get('empresa_id')
  if (!empresaId) return NextResponse.json({ error: 'empresa_id obrigatório' }, { status: 400 })

  const { data, error } = await supabase
    .from('conciliacao_regras')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('prioridade', { ascending: false })
    .order('keyword', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

/** POST /api/conciliacao/regras — cria ou atualiza regra */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { empresa_id, keyword, categoria, prioridade = 0 } = await req.json()
  if (!empresa_id || !keyword || !categoria) {
    return NextResponse.json({ error: 'empresa_id, keyword e categoria são obrigatórios' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('conciliacao_regras')
    .upsert({
      empresa_id,
      keyword:    keyword.toUpperCase().trim(),
      categoria,
      prioridade,
      criado_por: user.email!,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'empresa_id,keyword' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('conciliacao_log').insert({
    empresa_id,
    operador: user.email!,
    acao:     'regra_criada',
    detalhes: { keyword, categoria },
  })

  return NextResponse.json(data)
}

/** DELETE /api/conciliacao/regras — remove regra por id */
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { id, empresa_id } = await req.json()
  if (!id || !empresa_id) return NextResponse.json({ error: 'id e empresa_id obrigatórios' }, { status: 400 })

  const { error } = await supabase
    .from('conciliacao_regras')
    .delete()
    .eq('id', id)
    .eq('empresa_id', empresa_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
