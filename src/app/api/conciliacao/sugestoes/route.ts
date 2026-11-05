import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sugerirMatches } from '@/lib/conciliacao/matching'
import type { ExtratoItem, Lancamento } from '@/lib/conciliacao/types'

/**
 * GET /api/conciliacao/sugestoes?extrato_item_id=...&empresa_id=...
 *
 * Retorna os lançamentos do sistema mais prováveis para casar com
 * o item do extrato informado. Busca lançamentos com data ±7 dias
 * (margem ampla) e deixa o algoritmo filtrar por ±3 dias.
 *
 * LGPD: nenhum dado é enviado a serviços externos.
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const extratoItemId = req.nextUrl.searchParams.get('extrato_item_id')
  const empresaId     = req.nextUrl.searchParams.get('empresa_id')

  if (!extratoItemId || !empresaId) {
    return NextResponse.json({ error: 'Parâmetros obrigatórios ausentes' }, { status: 400 })
  }

  // Busca item do extrato
  const { data: item, error: errItem } = await supabase
    .from('extrato_itens')
    .select('*')
    .eq('id', extratoItemId)
    .eq('empresa_id', empresaId)
    .single<ExtratoItem>()

  if (errItem || !item) {
    return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
  }

  // Janela de busca: ±7 dias em torno da data do extrato
  const baseDate = new Date(item.data)
  const dataMenos7 = new Date(baseDate); dataMenos7.setDate(dataMenos7.getDate() - 7)
  const dataMais7  = new Date(baseDate); dataMais7.setDate(dataMais7.getDate() + 7)
  const isoMenos7 = dataMenos7.toISOString().slice(0, 10)
  const isoMais7  = dataMais7.toISOString().slice(0, 10)

  // Lançamentos na janela de datas para a empresa
  const { data: lancamentos, error: errLanc } = await supabase
    .from('lancamentos')
    .select('*')
    .eq('empresa_id', empresaId)
    .gte('data', isoMenos7)
    .lte('data', isoMais7)

  if (errLanc) return NextResponse.json({ error: errLanc.message }, { status: 500 })

  const sugestoes = sugerirMatches(item, (lancamentos ?? []) as Lancamento[])

  return NextResponse.json({ item, sugestoes })
}
