import type { ExtratoItem, Lancamento, MatchSugestao, ConciliacaoRegra } from './types'

const MS_PER_DAY = 86_400_000
const MAX_DIAS   = 3

/**
 * Para cada item do extrato, retorna a lista de lançamentos mais prováveis
 * ordenada por score decrescente.
 *
 * Critérios de pontuação:
 *   - Mesmo valor absoluto:          +100 pts
 *   - Mesma natureza (entrada/saída): +80  pts
 *   - Diferença de data 0 dias:      +60  pts
 *   - Diferença de data 1 dia:       +40  pts
 *   - Diferença de data 2 dias:      +20  pts
 *   - Diferença de data 3 dias:      +10  pts
 *   - Descrição contém palavra do extrato: +20 pts
 *
 * Total máximo: 260 pts.
 * Itens com score < 110 (valor + natureza) são descartados.
 */
export function sugerirMatches(
  item: ExtratoItem,
  lancamentos: Lancamento[],
  maxSugestoes = 5,
): MatchSugestao[] {
  const itemNatureza = item.valor >= 0 ? 'receita' : 'despesa'
  const itemAbs = Math.abs(item.valor)
  const itemDate = new Date(item.data)

  const scored: MatchSugestao[] = []

  for (const lanc of lancamentos) {
    // Lançamentos já conciliados (podem ter lancamento_id referenciado em outro extrato_item)
    // — incluídos na busca; a UI mostra o alerta

    const motivo: string[] = []
    let score = 0

    // 1. Valor
    const lancAbs = Math.abs(lanc.valor)
    if (Math.abs(lancAbs - itemAbs) < 0.01) {
      score += 100
      motivo.push('valor idêntico')
    } else {
      continue // sem valor igual, não é sugestão válida
    }

    // 2. Natureza (entrada / saída)
    if (lanc.tipo === itemNatureza) {
      score += 80
      motivo.push('mesmo tipo')
    } else {
      // Natureza diferente pode ocorrer em estornos — mantém mas pontua menos
      motivo.push('tipo diferente')
    }

    // 3. Data
    const lancDate = new Date(lanc.data)
    const diffDias = Math.abs((itemDate.getTime() - lancDate.getTime()) / MS_PER_DAY)
    if (diffDias > MAX_DIAS) continue

    if (diffDias < 1) {
      score += 60; motivo.push('mesma data')
    } else if (diffDias < 2) {
      score += 40; motivo.push('1 dia de diferença')
    } else if (diffDias < 3) {
      score += 20; motivo.push('2 dias de diferença')
    } else {
      score += 10; motivo.push('3 dias de diferença')
    }

    // 4. Semelhança textual (palavras do extrato na descrição do lançamento)
    const extratoWords = tokenize(item.descricao)
    const lancWords    = tokenize(lanc.descricao)
    const common = extratoWords.filter(w => lancWords.includes(w))
    if (common.length > 0) {
      score += 20
      motivo.push(`descrição similar (${common.slice(0, 2).join(', ')})`)
    }

    if (score >= 110) {
      scored.push({ lancamento: lanc, score, motivo })
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSugestoes)
}

// ---------------------------------------------------------------------------
// Regras padrão embutidas — cobertura de extratos brasileiros comuns
// Prioridade negativa: aplicadas apenas se nenhuma regra customizada bater
// ---------------------------------------------------------------------------
const REGRAS_PADRAO: Array<{ keyword: string; categoria: string }> = [
  // Pessoal / RH
  { keyword: 'FOLHA DE PAGAMENTO', categoria: 'Pessoal' },
  { keyword: 'FOLHA PAGAMENTO',    categoria: 'Pessoal' },
  { keyword: 'SALARIO',            categoria: 'Pessoal' },
  { keyword: 'SALÁRIO',            categoria: 'Pessoal' },
  { keyword: 'FGTS',               categoria: 'Pessoal' },
  { keyword: 'FERIAS',             categoria: 'Pessoal' },
  { keyword: 'FÉRIAS',             categoria: 'Pessoal' },
  { keyword: '13 SALARIO',         categoria: 'Pessoal' },
  { keyword: 'RESCISAO',           categoria: 'Pessoal' },
  { keyword: 'PRO LABORE',         categoria: 'Pessoal' },
  // Impostos / obrigações fiscais
  { keyword: 'INSS',               categoria: 'Impostos' },
  { keyword: 'IRPJ',               categoria: 'Impostos' },
  { keyword: 'IRPF',               categoria: 'Impostos' },
  { keyword: 'ISS',                categoria: 'Impostos' },
  { keyword: 'COFINS',             categoria: 'Impostos' },
  { keyword: 'PIS/',               categoria: 'Impostos' },
  { keyword: 'CSLL',               categoria: 'Impostos' },
  { keyword: 'DARF',               categoria: 'Impostos' },
  { keyword: 'GPS ',               categoria: 'Impostos' },
  { keyword: 'DAS ',               categoria: 'Impostos' }, // Simples Nacional
  { keyword: 'SIMPLES NACIONAL',   categoria: 'Impostos' },
  { keyword: 'GUIA PREVIDENCIA',   categoria: 'Impostos' },
  { keyword: 'IPTU',               categoria: 'Impostos' },
  { keyword: 'IPVA',               categoria: 'Impostos' },
  // Infraestrutura / utilidades
  { keyword: 'ALUGUEL',            categoria: 'Infraestrutura' },
  { keyword: 'LOCACAO',            categoria: 'Infraestrutura' },
  { keyword: 'LOCAÇÃO',            categoria: 'Infraestrutura' },
  { keyword: 'CONDOMINIO',         categoria: 'Infraestrutura' },
  { keyword: 'ENERGIA ELETRICA',   categoria: 'Infraestrutura' },
  { keyword: 'ENERGIA ELÉTRICA',   categoria: 'Infraestrutura' },
  { keyword: 'ENEL',               categoria: 'Infraestrutura' },
  { keyword: 'CEMIG',              categoria: 'Infraestrutura' },
  { keyword: 'CPFL',               categoria: 'Infraestrutura' },
  { keyword: 'CELPE',              categoria: 'Infraestrutura' },
  { keyword: 'COELBA',             categoria: 'Infraestrutura' },
  { keyword: 'SABESP',             categoria: 'Infraestrutura' },
  { keyword: 'COPASA',             categoria: 'Infraestrutura' },
  { keyword: 'AGUA E ESGOTO',      categoria: 'Infraestrutura' },
  { keyword: 'LIMPEZA',            categoria: 'Infraestrutura' },
  // Tecnologia / telecomunicações
  { keyword: 'INTERNET',           categoria: 'Tecnologia' },
  { keyword: 'BANDA LARGA',        categoria: 'Tecnologia' },
  { keyword: 'TIM ',               categoria: 'Tecnologia' },
  { keyword: 'VIVO',               categoria: 'Tecnologia' },
  { keyword: 'CLARO ',             categoria: 'Tecnologia' },
  { keyword: 'OI ',                categoria: 'Tecnologia' },
  { keyword: 'AWS',                categoria: 'Tecnologia' },
  { keyword: 'AMAZON WEB',         categoria: 'Tecnologia' },
  { keyword: 'AZURE',              categoria: 'Tecnologia' },
  { keyword: 'GOOGLE CLOUD',       categoria: 'Tecnologia' },
  { keyword: 'DIGITALOCEAN',       categoria: 'Tecnologia' },
  { keyword: 'GITHUB',             categoria: 'Tecnologia' },
  { keyword: 'ATLASSIAN',          categoria: 'Tecnologia' },
  { keyword: 'NOTION',             categoria: 'Tecnologia' },
  { keyword: 'SLACK',              categoria: 'Tecnologia' },
  { keyword: 'MICROSOFT',          categoria: 'Tecnologia' },
  // Marketing
  { keyword: 'GOOGLE ADS',         categoria: 'Marketing' },
  { keyword: 'META ADS',           categoria: 'Marketing' },
  { keyword: 'FACEBOOK ADS',       categoria: 'Marketing' },
  { keyword: 'LINKEDIN ADS',       categoria: 'Marketing' },
  { keyword: 'TIKTOK ADS',         categoria: 'Marketing' },
  { keyword: 'RD STATION',         categoria: 'Marketing' },
  { keyword: 'HUBSPOT',            categoria: 'Marketing' },
  { keyword: 'MAILCHIMP',          categoria: 'Marketing' },
  // Contabilidade
  { keyword: 'CONTABILIDADE',      categoria: 'Contabilidade' },
  { keyword: 'CONTADOR',           categoria: 'Contabilidade' },
  { keyword: 'AUDITORIA',          categoria: 'Contabilidade' },
  { keyword: 'ASSESSORIA CONTABIL',categoria: 'Contabilidade' },
  // Viagens / deslocamento
  { keyword: 'UBER',               categoria: 'Viagens' },
  { keyword: '99 APP',             categoria: 'Viagens' },
  { keyword: 'TAXI',               categoria: 'Viagens' },
  { keyword: 'PASSAGEM AEREA',     categoria: 'Viagens' },
  { keyword: 'PASSAGEM AÉREA',     categoria: 'Viagens' },
  { keyword: 'GOL LINHAS',         categoria: 'Viagens' },
  { keyword: 'LATAM',              categoria: 'Viagens' },
  { keyword: 'AZUL LINHAS',        categoria: 'Viagens' },
  { keyword: 'HOTEL',              categoria: 'Viagens' },
  { keyword: 'AIRBNB',             categoria: 'Viagens' },
  // Suporte / treinamento
  { keyword: 'TREINAMENTO',        categoria: 'Treinamento' },
  { keyword: 'CAPACITACAO',        categoria: 'Treinamento' },
  { keyword: 'CAPACITAÇÃO',        categoria: 'Treinamento' },
  { keyword: 'CURSO',              categoria: 'Treinamento' },
  { keyword: 'UDEMY',              categoria: 'Treinamento' },
  { keyword: 'COURSERA',           categoria: 'Treinamento' },
]

/**
 * Aplica regras de keyword à descrição do extrato e retorna a categoria,
 * ou undefined se nenhuma regra se aplicar.
 *
 * Regras customizadas do usuário têm prioridade; REGRAS_PADRAO são fallback.
 */
export function aplicarRegras(
  descricao: string,
  regras: ConciliacaoRegra[],
): string | undefined {
  const desc = descricao.toUpperCase()

  // 1. Regras customizadas (maior prioridade primeiro)
  const sorted = [...regras].sort((a, b) => b.prioridade - a.prioridade)
  for (const regra of sorted) {
    if (desc.includes(regra.keyword.toUpperCase())) {
      return regra.categoria
    }
  }

  // 2. Fallback: regras padrão embutidas (mais específicas primeiro)
  for (const regra of REGRAS_PADRAO) {
    if (desc.includes(regra.keyword.toUpperCase())) {
      return regra.categoria
    }
  }

  return undefined
}

/**
 * Calcula o painel de saldo para uma conta em um determinado mês.
 */
export function calcularSaldo(
  itens: ExtratoItem[],
  lancamentos: Lancamento[],
  mes: string, // 'YYYY-MM'
) {
  const prefix = mes

  const itensMes = itens.filter(i => i.data.startsWith(prefix))
  const lancMes  = lancamentos.filter(l => l.data.startsWith(prefix))

  const saldoExtrato = itensMes.reduce((acc, i) => acc + i.valor, 0)
  const saldoSistema = lancMes.reduce((acc, l) => {
    return acc + (l.tipo === 'receita' ? l.valor : -l.valor)
  }, 0)

  return {
    saldoExtrato,
    saldoSistema,
    diferenca: saldoExtrato - saldoSistema,
    totalItens: itensMes.length,
    itensPendentes: itensMes.filter(i => i.status === 'pendente').length,
    itensConciliados: itensMes.filter(i => i.status === 'conciliado').length,
    itensIgnorados: itensMes.filter(i => i.status === 'ignorado').length,
  }
}

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

function tokenize(text: string): string[] {
  return text
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3)
}
