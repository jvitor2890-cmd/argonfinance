export type StatusConciliacao = 'pendente' | 'conciliado' | 'ignorado'

export interface ExtratoItem {
  id: string
  conta_id: string
  empresa_id: string
  data: string          // ISO date YYYY-MM-DD
  valor: number         // positivo = crédito, negativo = débito
  descricao: string
  memo?: string
  fitid?: string
  hash?: string
  status: StatusConciliacao
  lancamento_id?: string
  categoria_sugerida?: string
  origem: 'ofx' | 'csv'
  importado_por: string
  created_at: string
  updated_at: string
}

export interface ExtratoConta {
  id: string
  empresa_id: string
  nome: string
  banco: string
  agencia?: string
  conta?: string
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface Lancamento {
  id: string
  empresa_id: string
  data: string
  descricao: string
  categoria: string
  tipo: 'receita' | 'despesa'
  forma_pagamento: string
  valor: number
  created_at: string
}

export interface ConciliacaoRegra {
  id: string
  empresa_id: string
  keyword: string
  categoria: string
  prioridade: number
  criado_por: string
  created_at: string
  updated_at: string
}

export interface ConciliacaoLog {
  id: string
  empresa_id: string
  operador: string
  acao: 'importacao' | 'conciliado' | 'desconciliado' | 'ignorado' | 'lancamento_criado' | 'mes_fechado' | 'regra_criada'
  extrato_item_id?: string
  lancamento_id?: string
  detalhes?: Record<string, unknown>
  created_at: string
}

export interface ConciliacaoFechamento {
  id: string
  empresa_id: string
  conta_id: string
  mes: string
  operador: string
  saldo_extrato: number
  saldo_sistema: number
  diferenca: number
  created_at: string
}

/** Sugestão de casamento retornada pelo algoritmo */
export interface MatchSugestao {
  lancamento: Lancamento
  score: number
  motivo: string[]
}

/** Resultado do parser OFX */
export interface OFXParseResult {
  banco: string
  conta: string
  agencia: string
  dataInicio: string
  dataFim: string
  transacoes: OFXTransacao[]
}

export interface OFXTransacao {
  fitid: string
  data: string
  valor: number
  descricao: string
  memo?: string
}

/** Configuração de colunas para import CSV */
export interface CSVConfig {
  colunaData: number      // índice da coluna (0-based)
  colunaDescricao: number
  colunaValor: number
  colunaCredito?: number
  colunaDebito?: number
  separador?: string      // padrão ','
  skipLinhas?: number     // linhas de cabeçalho a pular
  formatoData?: string    // 'DD/MM/YYYY' | 'YYYY-MM-DD'
}
