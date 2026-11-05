import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/conciliacao/fechar-mes
 * Fecha o mês de conciliação para uma conta — só permite quando diferença = 0.
 * Body: { empresa_id, conta_id, mes, saldo_extrato, saldo_sistema }
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { empresa_id, conta_id, mes, saldo_extrato, saldo_sistema } = await req.json()
  if (!empresa_id || !conta_id || !mes) {
    return NextResponse.json({ error: 'Parâmetros obrigatórios ausentes' }, { status: 400 })
  }

  const diferenca = Math.abs(saldo_extrato - saldo_sistema)
  if (diferenca > 0.01) {
    return NextResponse.json(
      { error: `Mês não pode ser fechado: diferença de R$ ${diferenca.toFixed(2)} pendente` },
      { status: 422 },
    )
  }

  const { data, error } = await supabase
    .from('conciliacao_fechamentos')
    .upsert({
      empresa_id,
      conta_id,
      mes: `${mes}-01`,   // primeiro dia do mês
      operador:    user.email!,
      saldo_extrato,
      saldo_sistema,
      created_at:  new Date().toISOString(),
    }, { onConflict: 'empresa_id,conta_id,mes' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('conciliacao_log').insert({
    empresa_id,
    operador: user.email!,
    acao:     'mes_fechado',
    detalhes: { conta_id, mes, saldo_extrato, saldo_sistema },
  })

  return NextResponse.json(data)
}
