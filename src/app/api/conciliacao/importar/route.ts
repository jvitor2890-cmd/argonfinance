import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseOFX } from '@/lib/conciliacao/ofx-parser'
import { parseCSV, csvConfigBB, csvConfigBradesco, csvConfigCora } from '@/lib/conciliacao/csv-parser'
import { aplicarRegras } from '@/lib/conciliacao/matching'
import { createHash } from 'crypto'
import type { ConciliacaoRegra } from '@/lib/conciliacao/types'

const csvConfigs: Record<string, typeof csvConfigBB> = {
  BB: csvConfigBB,
  Bradesco: csvConfigBradesco,
  Cora: csvConfigCora,
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const form = await req.formData()
  const file      = form.get('file') as File | null
  const contaId   = form.get('conta_id') as string
  const empresaId = form.get('empresa_id') as string
  const banco     = form.get('banco') as string   // para CSV

  if (!file || !contaId || !empresaId) {
    return NextResponse.json({ error: 'Parâmetros obrigatórios ausentes' }, { status: 400 })
  }

  const content = await file.text()
  const nome = file.name.toLowerCase()
  const tipo = nome.endsWith('.ofx') || nome.endsWith('.qfx') ? 'ofx' : 'csv'

  // Busca regras de keyword vigentes para sugestão automática de categoria
  const { data: regras } = await supabase
    .from('conciliacao_regras')
    .select('*')
    .eq('empresa_id', empresaId)

  const regrasList: ConciliacaoRegra[] = regras ?? []

  let transacoes: Array<{ fitid?: string; hash?: string; data: string; valor: number; descricao: string; memo?: string }>

  if (tipo === 'ofx') {
    const result = parseOFX(content)
    transacoes = result.transacoes.map(t => ({ ...t, hash: undefined }))
  } else {
    const config = csvConfigs[banco] ?? csvConfigBB
    const parsed = parseCSV(content, config, contaId)
    transacoes = parsed.map(t => ({
      data: t.data,
      valor: t.valor,
      descricao: t.descricao,
      fitid: undefined,
      hash: t.fitid,  // no CSV, fitid contém o hash
    }))
  }

  // Monta registros para inserção com upsert (deduplicação por fitid/hash)
  const registros = transacoes.map(t => {
    const categoriaSugerida = aplicarRegras(t.descricao, regrasList)
    const hashFinal = t.hash ?? createHash('sha256')
      .update(`${contaId}|${t.data}|${t.valor}|${t.descricao}`)
      .digest('hex')
      .slice(0, 32)

    return {
      conta_id:          contaId,
      empresa_id:        empresaId,
      data:              t.data,
      valor:             t.valor,
      descricao:         t.descricao,
      memo:              t.memo ?? null,
      fitid:             tipo === 'ofx' ? t.fitid ?? null : null,
      hash:              tipo === 'csv' ? hashFinal : null,
      status:            'pendente',
      categoria_sugerida: categoriaSugerida ?? null,
      origem:            tipo,
      importado_por:     user.email!,
    }
  })

  // Upsert: ignora duplicatas (conflict on fitid ou hash)
  const { data: inserted, error } = await supabase
    .from('extrato_itens')
    .upsert(registros, {
      onConflict: tipo === 'ofx' ? 'conta_id,fitid' : 'conta_id,hash',
      ignoreDuplicates: true,
    })
    .select('id')

  if (error) {
    console.error('[importar]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Audit log
  await supabase.from('conciliacao_log').insert({
    empresa_id: empresaId,
    operador:   user.email!,
    acao:       'importacao',
    detalhes:   {
      arquivo:        file.name,
      tipo,
      total:          transacoes.length,
      importados:     inserted?.length ?? 0,
    },
  })

  return NextResponse.json({
    total:      transacoes.length,
    importados: inserted?.length ?? 0,
    duplicatas: transacoes.length - (inserted?.length ?? 0),
  })
}
