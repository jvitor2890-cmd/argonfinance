export type TipoLancamento = 'receita' | 'despesa';

export type StatusCompromisso = 'pendente' | 'pago' | 'recebido' | 'atrasado';

export type TipoCompromisso = 'pagar' | 'receber';

export interface Lancamento {
  id: string;
  data: string;        // YYYY-MM-DD
  descricao: string;
  categoria: string;
  tipo: TipoLancamento;
  valor: number;
  formaPagamento: string;
}

export interface Compromisso {
  id: string;
  descricao: string;
  vencimento: string;  // YYYY-MM-DD
  valor: number;
  tipo: TipoCompromisso;
  status: StatusCompromisso;
  categoria: string;
}

export interface MonthlyData {
  mes: string;         // MMM/YY
  mesISO: string;      // YYYY-MM
  receita: number;
  despesa: number;
  resultado: number;
  margem: number;
}

export interface DashboardMetrics {
  receitaTotal: number;
  despesaTotal: number;
  resultadoGerencial: number;
  margemGerencial: number;
  contasAPagar: number;
  contasAReceber: number;
  monthlyData: MonthlyData[];
  despesasPorCategoria: { categoria: string; valor: number }[];
}
