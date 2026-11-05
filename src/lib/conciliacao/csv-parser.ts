import type { CSVConfig, OFXTransacao } from './types'
import { createHash } from 'crypto'

/**
 * Parser de CSV genérico para extratos bancários.
 * Configurável via CSVConfig para suportar layouts diferentes
 * (BB, Bradesco, Cora, etc.).
 *
 * Gera hash SHA-256 para deduplicação, já que CSV não tem FITID.
 */
export function parseCSV(
  raw: string,
  config: CSVConfig,
  contaId: string,
): OFXTransacao[] {
  const sep = config.separador ?? ','
  const skip = config.skipLinhas ?? 1
  const lines = raw
    .split(/\r?\n/)
    .slice(skip)
    .filter((l) => l.trim().length > 0)

  const result: OFXTransacao[] = []

  for (const line of lines) {
    const cols = splitCSVLine(line, sep)
    if (cols.length < 2) continue

    // Data
    const rawDate = cols[config.colunaData]?.trim() ?? ''
    const data = parseDateBR(rawDate, config.formatoData)
    if (!data) continue

    // Descrição
    const descricao = cols[config.colunaDescricao]?.trim() ?? ''

    // Valor: pode vir em coluna única (negativo = débito) ou em duas colunas
    let valor = 0
    if (config.colunaCredito !== undefined && config.colunaDebito !== undefined) {
      const credito = parseValorBR(cols[config.colunaCredito] ?? '0')
      const debito  = parseValorBR(cols[config.colunaDebito]  ?? '0')
      valor = credito - debito
    } else {
      valor = parseValorBR(cols[config.colunaValor] ?? '0')
    }

    if (valor === 0 && descricao === '') continue

    // Hash para deduplicação (substitui FITID no CSV)
    const hashInput = `${contaId}|${data}|${valor}|${descricao}`
    const hash = createHash('sha256').update(hashInput).digest('hex').slice(0, 32)

    result.push({
      fitid: hash,   // usamos o hash como FITID para CSV (campo hash no DB)
      data,
      valor,
      descricao: descricao || `Lançamento ${data}`,
    })
  }

  return result
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function splitCSVLine(line: string, sep: string): string[] {
  const result: string[] = []
  let cur = ''
  let inQuote = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') { cur += '"'; i++ }
      else inQuote = !inQuote
    } else if (ch === sep && !inQuote) {
      result.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  result.push(cur)
  return result
}

function parseDateBR(raw: string, fmt?: string): string | null {
  if (!raw) return null
  const format = fmt ?? 'DD/MM/YYYY'
  let day = '', month = '', year = ''

  if (format === 'DD/MM/YYYY') {
    const p = raw.trim().split(/[\/\-]/)
    if (p.length !== 3) return null
    ;[day, month, year] = p
  } else if (format === 'YYYY-MM-DD') {
    const p = raw.trim().split('-')
    if (p.length !== 3) return null
    ;[year, month, day] = p
  } else {
    return null
  }

  if (!day || !month || !year) return null
  return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

function parseValorBR(raw: string): number {
  if (!raw) return 0
  // Remove espaços, R$, aspas
  let v = raw.trim().replace(/[R$\s"]/g, '')
  // Formato brasileiro: 1.234,56 → 1234.56
  if (v.includes(',')) {
    v = v.replace(/\./g, '').replace(',', '.')
  }
  return parseFloat(v) || 0
}

// ---------------------------------------------------------------------------
// Configurações pré-definidas para bancos comuns
// ---------------------------------------------------------------------------

export const csvConfigBB: CSVConfig = {
  colunaData: 0,
  colunaDescricao: 1,
  colunaValor: 2,
  separador: ';',
  skipLinhas: 3,
  formatoData: 'DD/MM/YYYY',
}

export const csvConfigBradesco: CSVConfig = {
  colunaData: 0,
  colunaDescricao: 2,
  colunaValor: 3,
  separador: ';',
  skipLinhas: 2,
  formatoData: 'DD/MM/YYYY',
}

export const csvConfigCora: CSVConfig = {
  colunaData: 0,
  colunaDescricao: 1,
  colunaCredito: 2,
  colunaDebito: 3,
  colunaValor: 2,
  separador: ',',
  skipLinhas: 1,
  formatoData: 'YYYY-MM-DD',
}
