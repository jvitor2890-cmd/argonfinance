'use client'

import type { ExtratoItem, MatchSugestao } from '@/lib/conciliacao/types'

interface Props {
  item: ExtratoItem
  sugestoes: MatchSugestao[]
  loading: boolean
  onCasar: (extratoItemId: string, lancamentoId: string) => void
  onClose: () => void
  onCriarLancamento: () => void
}

function fmt(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function fmtDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR')
}

function ScoreBadge({ score }: { score: number }) {
  const pct = Math.min(100, Math.round((score / 260) * 100))
  const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-400' : 'bg-orange-400'
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-gray-500">{pct}%</span>
    </div>
  )
}

export default function ModalSugestoes({ item, sugestoes, loading, onCasar, onClose, onCriarLancamento }: Props) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Sugestões de Casamento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        {/* Item do extrato */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-gray-500 mb-1">Item do extrato</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">{item.descricao}</p>
              <p className="text-xs text-gray-500">{fmtDate(item.data)}</p>
            </div>
            <p className={`text-base font-semibold ${item.valor >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {fmt(item.valor)}
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-32 text-sm text-gray-400">
            Buscando sugestões...
          </div>
        )}

        {!loading && sugestoes.length === 0 && (
          <div className="text-center py-8 text-sm text-gray-400">
            <p>Nenhum lançamento compatível encontrado.</p>
            <p className="text-xs mt-1">O lançamento pode estar em outro mês ou ainda não ter sido registrado.</p>
          </div>
        )}

        {!loading && sugestoes.length > 0 && (
          <div className="space-y-2 max-h-72 overflow-y-auto mb-4">
            {sugestoes.map(s => (
              <div
                key={s.lancamento.id}
                className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400">{fmtDate(s.lancamento.data)}</span>
                      <span className={`text-[10px] px-1.5 rounded-full font-medium
                        ${s.lancamento.tipo === 'receita' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {s.lancamento.tipo}
                      </span>
                      <span className="text-[10px] text-gray-400">{s.lancamento.categoria}</span>
                    </div>
                    <p className="text-sm text-gray-800 font-medium">{s.lancamento.descricao}</p>
                    <ScoreBadge score={s.score} />
                    <p className="text-[10px] text-gray-400 mt-0.5">{s.motivo.join(' · ')}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-semibold ${s.lancamento.tipo === 'receita' ? 'text-green-600' : 'text-red-500'}`}>
                      {s.lancamento.tipo === 'despesa' ? '-' : ''}{fmt(s.lancamento.valor)}
                    </p>
                    <button
                      onClick={() => onCasar(item.id, s.lancamento.id)}
                      className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <button
            onClick={onCriarLancamento}
            className="text-sm text-blue-600 hover:underline"
          >
            Criar novo lançamento a partir deste item
          </button>
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
