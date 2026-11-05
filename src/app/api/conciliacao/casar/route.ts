import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/** POST /api/conciliacao/casar
 * Concilia um item do extrato com um lançamento do sistema.
 * Body: { extrato_item_id, lancamento_id, empresa_id }
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { extrato_item_id, lancamento_id, empresa_id } = await req.json()
  if (!extrato_item_id || !lancamento_id || !empresa_id) {
    return NextResponse.json({ error: 'Parâmetros obrigatórios ausentes' }, { status: 400 })
  }

  // Atualiza o item do extrato
  const { error: errItem } = await supabase
    .from('extrato_itens')
    .update({ status: 'conciliado', lancamento_id, updated_at: new Date().toISOString() })
    .eq('id', extrato_item_id)
    .eq('empresa_id', empresa_id)

  if (errItem) return NextResponse.json({ error: errItem.message }, { status: 500 })

  // Audit log
  await supabase.from('conciliacao_log').insert({
    empresa_id,
    operador:         user.email!,
    acao:             'conciliado',
    extrato_item_id,
    lancamento_id,
    detalhes:         { casado_em: new Date().toISOString() },
  })

  return NextResponse.json({ ok: true })
}

/** DELETE /api/conciliacao/casar
 * Desfaz a conciliação de um item do extrato.
 * Body: { extrato_item_id, empresa_id }
 */
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { extrato_item_id, empresa_id } = await req.json()

  const { error } = await supabase
    .from('extrato_itens')
    .update({ status: 'pendente', lancamento_id: null, updated_at: new Date().toISOString() })
    .eq('id', extrato_item_id)
    .eq('empresa_id', empresa_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('conciliacao_log').insert({
    empresa_id,
    operador:        user.email!,
    acao:            'desconciliado',
    extrato_item_id,
    detalhes:        { desfeito_em: new Date().toISOString() },
  })

  return NextResponse.json({ ok: true })
}
