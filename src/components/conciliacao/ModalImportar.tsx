'use client'

import { useState } from 'react'
import type { ExtratoConta } from '@/lib/conciliacao/types'

interface Props {
  empresaId: string
  contas: ExtratoConta[]
  onClose: () => void
  onImportado: () => void
}

const bancos = ['BB', 'Bradesco', 'Cora', 'Itaú', 'Santander', 'Nubank', 'Outro']

export default function ModalImportar({ empresaId, contas, onClose, onImportado }: Props) {
  const [contaId, setContaId]       = useState(contas[0]?.id ?? '')
  const [banco, setBanco]           = useState('BB')
  const [file, setFile]             = useState<File | null>(null)
  const [loading, setLoading]       = useState(false)
  const [resultado, setResultado]   = useState<{ total: number; importados: number; duplicatas: number } | null>(null)
  const [erro, setErro]             = useState('')

  // Criação de nova conta bancária
  const [novaConta, setNovaConta]   = useState(false)
  const [nomeNovaConta, setNomeNovaConta] = useState('')
  const [bancoNovaConta, setBancoNovaConta] = useState('BB')

  async function handleCriarConta() {
    const res = await fetch('/api/conciliacao/contas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ empresa_id: empresaId, nome: nomeNovaConta, banco: bancoNovaConta }),
    })
    if (res.ok) {
      const c = await res.json()
      setContaId(c.id)
      setNovaConta(false)
      setNomeNovaConta('')
    }
  }

  async function handleImportar() {
    if (!file || !contaId) { setErro('Selecione um arquivo e uma conta.'); return }
    setLoading(true); setErro(''); setResultado(null)
    const form = new FormData()
    form.append('file', file)
    form.append('conta_id', contaId)
    form.append('empresa_id', empresaId)
    form.append('banco', banco)

    const res = await fetch('/api/conciliacao/importar', { method: 'POST', body: form })
    setLoading(false)
    if (res.ok) {
      const data = await res.json()
      setResultado(data)
      onImportado()
    } else {
      const e = await res.json()
      setErro(e.error ?? 'Erro ao importar')
    }
  }

  const isOFX = file?.name.toLowerCase().endsWith('.ofx') || file?.name.toLowerCase().endsWith('.qfx')

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Importar Extrato</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        {/* Conta bancária */}
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Conta bancária</label>
          {!novaConta ? (
            <div className="flex gap-2">
              <select
                value={contaId}
                onChange={e => setContaId(e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
              >
                {contas.map(c => <option key={c.id} value={c.id}>{c.banco} · {c.nome}</option>)}
              </select>
              <button
                onClick={() => setNovaConta(true)}
                className="text-xs text-blue-600 hover:underline whitespace-nowrap"
              >
                + Nova conta
              </button>
            </div>
          ) : (
            <div className="border border-blue-200 rounded p-3 bg-blue-50 space-y-2">
              <input
                placeholder="Nome da conta (ex: Conta Corrente PJ)"
                value={nomeNovaConta}
                onChange={e => setNomeNovaConta(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
              />
              <select
                value={bancoNovaConta}
                onChange={e => setBancoNovaConta(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
              >
                {bancos.map(b => <option key={b}>{b}</option>)}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleCriarConta}
                  disabled={!nomeNovaConta}
                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  Criar
                </button>
                <button onClick={() => setNovaConta(false)} className="text-xs text-gray-500">
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Arquivo */}
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Arquivo (OFX ou CSV)</label>
          <input
            type="file"
            accept=".ofx,.qfx,.csv"
            onChange={e => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:bg-gray-100 file:text-gray-700"
          />
        </div>

        {/* Banco (somente para CSV) */}
        {file && !isOFX && (
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">
              Banco do CSV <span className="text-xs text-gray-400">(para usar o layout correto)</span>
            </label>
            <select
              value={banco}
              onChange={e => setBanco(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              {bancos.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
        )}

        {/* Aviso LGPD */}
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-700">
          <strong>LGPD:</strong> Os dados do extrato são processados localmente e armazenados apenas no banco de dados seguro do ARGON. Nenhum dado é enviado a serviços externos de IA.
        </div>

        {erro && <p className="text-sm text-red-500 mb-3">{erro}</p>}

        {resultado && (
          <div className="mb-3 bg-green-50 border border-green-200 rounded p-3 text-sm text-green-700">
            ✓ {resultado.importados} novo(s) item(ns) importado(s).
            {resultado.duplicatas > 0 && ` ${resultado.duplicatas} duplicata(s) ignorada(s).`}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="text-sm text-gray-600 px-4 py-2">Fechar</button>
          <button
            onClick={handleImportar}
            disabled={loading || !file || !contaId}
            className="text-sm bg-argon-blue text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-argon-blue-light transition-colors disabled:opacity-50"
          >
            {loading ? 'Importando...' : 'Importar'}
          </button>
        </div>
      </div>
    </div>
  )
}
