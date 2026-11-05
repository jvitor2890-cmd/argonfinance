import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/** POST /api/conciliacao/ignorar
 * Marca um item do extrato como ignorado (ex: tarifa bancária).
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { extrato_item_id, empresa_id } = await req.json()
  if (!extrato_item_id || !empresa_id) {
    return NextResponse.json({ error: 'Parâmetros obrigatórios ausentes' }, { status: 400 })
  }

  const { error } = await supabase
    .from('extrato_itens')
    .update({ status: 'ignorado', lancamento_id: null, updated_at: new Date().toISOString() })
    .eq('id', extrato_item_id)
    .eq('empresa_id', empresa_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('conciliacao_log').insert({
    empresa_id,
    operador:        user.email!,
    acao:            'ignorado',
    extrato_item_id,
    detalhes:        { ignorado_em: new Date().toISOString() },
  })

  return NextResponse.json({ ok: true })
}
