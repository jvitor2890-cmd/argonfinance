'use client'

import { useState, useEffect } from 'react'
import type { ConciliacaoRegra } from '@/lib/conciliacao/types'

const CATEGORIAS = [
  'Consultoria', 'Desenvolvimento', 'Suporte', 'Treinamento',
  'Pessoal', 'Infraestrutura', 'Tecnologia', 'Impostos',
  'Marketing', 'Contabilidade', 'Viagens', 'Outro',
]

interface Props {
  empresaId: string
  onClose: () => void
}

export default function RegrasCategoria({ empresaId, onClose }: Props) {
  const [regras, setRegras]       = useState<ConciliacaoRegra[]>([])
  const [loading, setLoading]     = useState(true)
  const [keyword, setKeyword]     = useState('')
  const [categoria, setCategoria] = useState('')
  const [salvando, setSalvando]   = useState(false)
  const [erro, setErro]           = useState('')

  async function fetchRegras() {
    setLoading(true)
    const res = await fetch(`/api/conciliacao/regras?empresa_id=${empresaId}`)
    if (res.ok) setRegras(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchRegras() }, [empresaId])

  async function handleSalvar() {
    if (!keyword || !categoria) { setErro('Preencha keyword e categoria.'); return }
    setSalvando(true); setErro('')
    const res = await fetch('/api/conciliacao/regras', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ empresa_id: empresaId, keyword, categoria }),
    })
    setSalvando(false)
    if (res.ok) { setKeyword(''); setCategoria(''); fetchRegras() }
    else { const e = await res.json(); setErro(e.error ?? 'Erro') }
  }

  async function handleDeletar(id: string) {
    if (!confirm('Remover esta regra?')) return
    await fetch('/api/conciliacao/regras', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, empresa_id: empresaId }),
    })
    fetchRegras()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Regras de Categoria</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Palavra-chave encontrada na descrição → categoria atribuída automaticamente
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        {/* Formulário de nova regra */}
        <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
          <p className="text-sm font-medium text-gray-700 mb-3">Nova regra</p>
          <div className="flex gap-2">
            <input
              placeholder="Palavra-chave (ex: TIM)"
              value={keyword}
              onChange={e => setKeyword(e.target.value.toUpperCase())}
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm uppercase"
            />
            <select
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">— categoria —</option>
              {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
            </select>
            <button
              onClick={handleSalvar}
              disabled={salvando || !keyword || !categoria}
              className="bg-argon-blue text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-argon-blue-light transition-colors disabled:opacity-50"
            >
              {salvando ? '...' : 'Salvar'}
            </button>
          </div>
          {erro && <p className="text-xs text-red-500 mt-2">{erro}</p>}
        </div>

        {/* Lista de regras existentes */}
        <div className="max-h-72 overflow-y-auto">
          {loading && <p className="text-sm text-gray-400 py-4 text-center">Carregando...</p>}
          {!loading && regras.length === 0 && (
            <p className="text-sm text-gray-400 py-4 text-center">
              Nenhuma regra cadastrada. Adicione a primeira acima.
            </p>
          )}
          {!loading && regras.map(regra => (
            <div key={regra.id} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3">
                <code className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono">
                  {regra.keyword}
                </code>
                <span className="text-xs text-gray-400">→</span>
                <span className="text-sm text-gray-700">{regra.categoria}</span>
              </div>
              <button
                onClick={() => handleDeletar(regra.id)}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Remover
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-4 pt-3 border-t border-gray-100">
          <button onClick={onClose} className="text-sm text-gray-600 px-4 py-2">Fechar</button>
        </div>
      </div>
    </div>
  )
}
