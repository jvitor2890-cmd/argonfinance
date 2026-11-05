import type { OFXParseResult, OFXTransacao } from './types'

/**
 * Parser para arquivos OFX (Open Financial Exchange) versão 1.x (SGML)
 * e 2.x (XML). Extrai transações do STMTTRN para conciliação bancária.
 *
 * Bancos suportados: BB, Bradesco, Cora, Itaú, Santander, Nubank (OFX).
 */
export function parseOFX(raw: string): OFXParseResult {
  const content = raw.trim()

  // OFX 2.x é XML válido; 1.x é SGML (sem fechamento de tags)
  const isXML = content.startsWith('<?xml') || content.includes('<OFX>')

  if (isXML && content.startsWith('<?xml')) {
    return parseOFXXML(content)
  }
  return parseOFXSGML(content)
}

// ---------------------------------------------------------------------------
// Parser SGML (OFX 1.x) — a versão mais comum nos bancos brasileiros
// ---------------------------------------------------------------------------

function parseOFXSGML(content: string): OFXParseResult {
  // Remove cabeçalho (linhas OFXHEADER:, DATA:, etc.) até <OFX>
  const bodyStart = content.indexOf('<OFX>')
  const body = bodyStart >= 0 ? content.slice(bodyStart) : content

  const get = (tag: string): string => {
    const re = new RegExp(`<${tag}>([^<\n\r]*)`, 'i')
    const m = body.match(re)
    return m ? m[1].trim() : ''
  }

  const banco   = get('FI>ORG') || get('ORG')
  const conta   = get('ACCTID')
  const agencia = get('BRANCHID') || ''

  const dataInicio = ofxDateToISO(get('DTSTART'))
  const dataFim    = ofxDateToISO(get('DTEND'))

  const transacoes: OFXTransacao[] = []

  // Extrai blocos <STMTTRN>...</STMTTRN>
  const stmtRe = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi
  let m: RegExpExecArray | null
  while ((m = stmtRe.exec(body)) !== null) {
    const block = m[1]
    const tGet = (tag: string) => {
      const r = new RegExp(`<${tag}>([^<\n\r]*)`, 'i')
      const mm = block.match(r)
      return mm ? mm[1].trim() : ''
    }

    const fitid   = tGet('FITID')
    const rawDate = tGet('DTPOSTED') || tGet('DTUSER')
    const rawAmt  = tGet('TRNAMT')
    const name    = tGet('NAME') || tGet('PAYEE')
    const memo    = tGet('MEMO')

    if (!fitid || !rawDate || !rawAmt) continue

    transacoes.push({
      fitid,
      data:     ofxDateToISO(rawDate),
      valor:    parseFloat(rawAmt.replace(',', '.')),
      descricao: name || memo || fitid,
      memo:     memo || undefined,
    })
  }

  // Fallback: OFX SGML real do BB e Bradesco (sem </STMTTRN>, tags simples linha a linha)
  if (transacoes.length === 0) {
    const lines = body.split(/\r?\n/)
    let current: Partial<OFXTransacao> = {}
    let inTrn = false

    for (const line of lines) {
      const l = line.trim()
      // Abertura de bloco (com ou sem fechamento na mesma linha)
      if (/^<STMTTRN>/i.test(l)) { inTrn = true; current = {}; continue }
      // Fechamento explícito
      if (/^<\/STMTTRN>/i.test(l)) {
        if (current.fitid && current.data && current.valor !== undefined) {
          transacoes.push({
            fitid:    current.fitid,
            data:     current.data,
            valor:    current.valor,
            descricao: current.descricao || current.fitid,
            memo:     current.memo,
          })
        }
        inTrn = false; current = {}; continue
      }
      // Próximo bloco STMTTRN sem fechamento explícito do anterior (BB real)
      if (inTrn && /^<STMTTRN>/i.test(l)) {
        if (current.fitid && current.data && current.valor !== undefined) {
          transacoes.push({
            fitid:    current.fitid,
            data:     current.data,
            valor:    current.valor,
            descricao: current.descricao || current.fitid,
            memo:     current.memo,
          })
        }
        current = {}; continue
      }

      if (!inTrn) continue

      const tagVal = l.match(/^<([A-Z0-9.]+)>(.*)$/i)
      if (!tagVal) continue
      const [, tag, val] = tagVal
      switch (tag.toUpperCase()) {
        case 'FITID':    current.fitid    = val.trim(); break
        case 'DTPOSTED':
        case 'DTUSER':   if (!current.data) current.data = ofxDateToISO(val.trim()); break
        case 'TRNAMT':   current.valor    = parseFloat(val.replace(',', '.')); break
        case 'NAME':
        case 'PAYEE':    current.descricao = val.trim(); break
        case 'MEMO':     current.memo     = val.trim(); break
      }
    }
    // Último bloco sem </STMTTRN>
    if (inTrn && current.fitid && current.data && current.valor !== undefined) {
      transacoes.push({
        fitid:    current.fitid,
        data:     current.data,
        valor:    current.valor,
        descricao: current.descricao || current.fitid,
        memo:     current.memo,
      })
    }
  }

  return { banco, conta, agencia, dataInicio, dataFim, transacoes }
}

// ---------------------------------------------------------------------------
// Parser XML (OFX 2.x)
// ---------------------------------------------------------------------------

function parseOFXXML(content: string): OFXParseResult {
  const getTag = (src: string, tag: string): string => {
    const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
    const m = src.match(re)
    return m ? m[1].trim() : ''
  }

  const banco   = getTag(content, 'ORG')
  const conta   = getTag(content, 'ACCTID')
  const agencia = getTag(content, 'BRANCHID')
  const dataInicio = ofxDateToISO(getTag(content, 'DTSTART'))
  const dataFim    = ofxDateToISO(getTag(content, 'DTEND'))

  const transacoes: OFXTransacao[] = []
  const stmtRe = /<STMTTRN[^>]*>([\s\S]*?)<\/STMTTRN>/gi
  let m: RegExpExecArray | null
  while ((m = stmtRe.exec(content)) !== null) {
    const block = m[1]
    const fitid = getTag(block, 'FITID')
    const rawDate = getTag(block, 'DTPOSTED') || getTag(block, 'DTUSER')
    const rawAmt  = getTag(block, 'TRNAMT')
    const name    = getTag(block, 'NAME') || getTag(block, 'PAYEE')
    const memo    = getTag(block, 'MEMO')
    if (!fitid || !rawDate || !rawAmt) continue
    transacoes.push({
      fitid,
      data:     ofxDateToISO(rawDate),
      valor:    parseFloat(rawAmt.replace(',', '.')),
      descricao: name || memo || fitid,
      memo:     memo || undefined,
    })
  }

  return { banco, conta, agencia, dataInicio, dataFim, transacoes }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converte data OFX (YYYYMMDD ou YYYYMMDDHHMMSS) para ISO (YYYY-MM-DD).
 */
export function ofxDateToISO(raw: string): string {
  const d = raw.replace(/[^0-9]/g, '').slice(0, 8)
  if (d.length !== 8) return ''
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`
}
