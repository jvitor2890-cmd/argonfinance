import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/conciliacao/criar-lancamento
 * Cria um lançamento no sistema a partir de um item do extrato e concilia
 * automaticamente os dois.
 *
 * Body: {
 *   extrato_item_id, empresa_id,
 *   descricao, categoria, forma,
 *   // valor e data são derivados do extrato_item
 * }
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { extrato_item_id, empresa_id, descricao, categoria, forma } = await req.json()
  if (!extrato_item_id || !empresa_id || !descricao || !categoria) {
    return NextResponse.json({ error: 'Parâmetros obrigatórios ausentes' }, { status: 400 })
  }

  // Busca item do extrato
  const { data: item, error: errItem } = await supabase
    .from('extrato_itens')
    .select('*')
    .eq('id', extrato_item_id)
    .eq('empresa_id', empresa_id)
    .single()

  if (errItem || !item) return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })

  const tipo = item.valor >= 0 ? 'receita' : 'despesa'
  const valor = Math.abs(item.valor)

  // Cria lançamento
  const { data: lancamento, error: errLanc } = await supabase
    .from('lancamentos')
    .insert({
      empresa_id,
      operador_id:     user.id,
      data:            item.data,
      descricao,
      categoria,
      tipo,
      forma_pagamento: forma ?? 'Outro',
      valor,
      situacao:        'realizado',
      competencia:     item.data.slice(0, 7),
    })
    .select()
    .single()

  if (errLanc || !lancamento) {
    return NextResponse.json({ error: errLanc?.message ?? 'Erro ao criar lançamento' }, { status: 500 })
  }

  // Concilia automaticamente
  await supabase
    .from('extrato_itens')
    .update({ status: 'conciliado', lancamento_id: lancamento.id, updated_at: new Date().toISOString() })
    .eq('id', extrato_item_id)

  // Audit log
  await supabase.from('conciliacao_log').insert({
    empresa_id,
    operador:        user.email!,
    acao:            'lancamento_criado',
    extrato_item_id,
    lancamento_id:   lancamento.id,
    detalhes:        { descricao, categoria, forma, valor, tipo },
  })

  return NextResponse.json({ lancamento, ok: true })
}
