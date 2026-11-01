import { format, parseISO, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Lancamento, Compromisso, DashboardMetrics, MonthlyData } from '@/types';

// ─── Lançamentos ──────────────────────────────────────────────────────────────
// Empresa: Nexus Consultoria & Tecnologia Ltda
// Período: Janeiro – Outubro 2026

export const LANCAMENTOS: Lancamento[] = [
  // ── JANEIRO 2026 ──────────────────────────────
  { id: 'r01', data: '2026-01-08', descricao: 'Consultoria TI – Grupo Alpha', categoria: 'Consultoria', tipo: 'receita', valor: 32000, formaPagamento: 'Transferência' },
  { id: 'r02', data: '2026-01-15', descricao: 'Desenvolvimento de software – Beta S.A.', categoria: 'Desenvolvimento', tipo: 'receita', valor: 28000, formaPagamento: 'Boleto' },
  { id: 'r03', data: '2026-01-22', descricao: 'Suporte técnico mensal – Gama Ltda', categoria: 'Suporte', tipo: 'receita', valor: 9500, formaPagamento: 'Transferência' },
  { id: 'd01', data: '2026-01-05', descricao: 'Folha de pagamento – janeiro', categoria: 'Pessoal', tipo: 'despesa', valor: 38000, formaPagamento: 'Transferência' },
  { id: 'd02', data: '2026-01-05', descricao: 'Aluguel escritório', categoria: 'Infraestrutura', tipo: 'despesa', valor: 6500, formaPagamento: 'Débito automático' },
  { id: 'd03', data: '2026-01-10', descricao: 'Pacote Google Workspace', categoria: 'Tecnologia', tipo: 'despesa', valor: 1200, formaPagamento: 'Cartão de crédito' },
  { id: 'd04', data: '2026-01-15', descricao: 'ISS e impostos sobre serviços', categoria: 'Impostos', tipo: 'despesa', valor: 4950, formaPagamento: 'DARF' },
  { id: 'd05', data: '2026-01-20', descricao: 'Marketing digital', categoria: 'Marketing', tipo: 'despesa', valor: 3200, formaPagamento: 'Cartão de crédito' },
  { id: 'd06', data: '2026-01-28', descricao: 'Contabilidade', categoria: 'Contabilidade', tipo: 'despesa', valor: 1800, formaPagamento: 'Transferência' },

  // ── FEVEREIRO 2026 ────────────────────────────
  { id: 'r04', data: '2026-02-05', descricao: 'Consultoria TI – Grupo Alpha', categoria: 'Consultoria', tipo: 'receita', valor: 32000, formaPagamento: 'Transferência' },
  { id: 'r05', data: '2026-02-12', descricao: 'Desenvolvimento de software – Beta S.A.', categoria: 'Desenvolvimento', tipo: 'receita', valor: 31000, formaPagamento: 'Boleto' },
  { id: 'r06', data: '2026-02-20', descricao: 'Suporte técnico – Gama Ltda', categoria: 'Suporte', tipo: 'receita', valor: 9500, formaPagamento: 'Transferência' },
  { id: 'r07', data: '2026-02-25', descricao: 'Treinamento equipe – Delta Corp', categoria: 'Treinamento', tipo: 'receita', valor: 7500, formaPagamento: 'Boleto' },
  { id: 'd07', data: '2026-02-05', descricao: 'Folha de pagamento – fevereiro', categoria: 'Pessoal', tipo: 'despesa', valor: 38000, formaPagamento: 'Transferência' },
  { id: 'd08', data: '2026-02-05', descricao: 'Aluguel escritório', categoria: 'Infraestrutura', tipo: 'despesa', valor: 6500, formaPagamento: 'Débito automático' },
  { id: 'd09', data: '2026-02-10', descricao: 'Licenças de software', categoria: 'Tecnologia', tipo: 'despesa', valor: 2800, formaPagamento: 'Cartão de crédito' },
  { id: 'd10', data: '2026-02-15', descricao: 'ISS e impostos', categoria: 'Impostos', tipo: 'despesa', valor: 5850, formaPagamento: 'DARF' },
  { id: 'd11', data: '2026-02-20', descricao: 'Viagem – reunião cliente SP', categoria: 'Viagens', tipo: 'despesa', valor: 1800, formaPagamento: 'Cartão de crédito' },
  { id: 'd12', data: '2026-02-28', descricao: 'Contabilidade', categoria: 'Contabilidade', tipo: 'despesa', valor: 1800, formaPagamento: 'Transferência' },

  // ── MARÇO 2026 ────────────────────────────────
  { id: 'r08', data: '2026-03-07', descricao: 'Consultoria TI – Grupo Alpha', categoria: 'Consultoria', tipo: 'receita', valor: 35000, formaPagamento: 'Transferência' },
  { id: 'r09', data: '2026-03-14', descricao: 'Desenvolvimento de software – Beta S.A.', categoria: 'Desenvolvimento', tipo: 'receita', valor: 33000, formaPagamento: 'Boleto' },
  { id: 'r10', data: '2026-03-18', descricao: 'Suporte técnico – Gama Ltda', categoria: 'Suporte', tipo: 'receita', valor: 9500, formaPagamento: 'Transferência' },
  { id: 'r11', data: '2026-03-25', descricao: 'Novo contrato – Épsilon TI', categoria: 'Consultoria', tipo: 'receita', valor: 15000, formaPagamento: 'Transferência' },
  { id: 'd13', data: '2026-03-05', descricao: 'Folha de pagamento – março', categoria: 'Pessoal', tipo: 'despesa', valor: 40000, formaPagamento: 'Transferência' },
  { id: 'd14', data: '2026-03-05', descricao: 'Aluguel escritório', categoria: 'Infraestrutura', tipo: 'despesa', valor: 6500, formaPagamento: 'Débito automático' },
  { id: 'd15', data: '2026-03-12', descricao: 'Marketing digital', categoria: 'Marketing', tipo: 'despesa', valor: 4500, formaPagamento: 'Cartão de crédito' },
  { id: 'd16', data: '2026-03-15', descricao: 'ISS e impostos', categoria: 'Impostos', tipo: 'despesa', valor: 6975, formaPagamento: 'DARF' },
  { id: 'd17', data: '2026-03-20', descricao: 'Treinamento equipe interna', categoria: 'Pessoal', tipo: 'despesa', valor: 2500, formaPagamento: 'Boleto' },
  { id: 'd18', data: '2026-03-28', descricao: 'Contabilidade', categoria: 'Contabilidade', tipo: 'despesa', valor: 1800, formaPagamento: 'Transferência' },

  // ── ABRIL 2026 ────────────────────────────────
  { id: 'r12', data: '2026-04-08', descricao: 'Consultoria TI – Grupo Alpha', categoria: 'Consultoria', tipo: 'receita', valor: 35000, formaPagamento: 'Transferência' },
  { id: 'r13', data: '2026-04-15', descricao: 'Desenvolvimento de software – Beta S.A.', categoria: 'Desenvolvimento', tipo: 'receita', valor: 28000, formaPagamento: 'Boleto' },
  { id: 'r14', data: '2026-04-20', descricao: 'Suporte técnico – Gama Ltda', categoria: 'Suporte', tipo: 'receita', valor: 9500, formaPagamento: 'Transferência' },
  { id: 'r15', data: '2026-04-22', descricao: 'Consultoria Épsilon TI', categoria: 'Consultoria', tipo: 'receita', valor: 15000, formaPagamento: 'Transferência' },
  { id: 'd19', data: '2026-04-05', descricao: 'Folha de pagamento – abril', categoria: 'Pessoal', tipo: 'despesa', valor: 40000, formaPagamento: 'Transferência' },
  { id: 'd20', data: '2026-04-05', descricao: 'Aluguel escritório', categoria: 'Infraestrutura', tipo: 'despesa', valor: 6500, formaPagamento: 'Débito automático' },
  { id: 'd21', data: '2026-04-10', descricao: 'Licenças de software', categoria: 'Tecnologia', tipo: 'despesa', valor: 1800, formaPagamento: 'Cartão de crédito' },
  { id: 'd22', data: '2026-04-15', descricao: 'ISS e impostos', categoria: 'Impostos', tipo: 'despesa', valor: 6562, formaPagamento: 'DARF' },
  { id: 'd23', data: '2026-04-28', descricao: 'Contabilidade', categoria: 'Contabilidade', tipo: 'despesa', valor: 1800, formaPagamento: 'Transferência' },

  // ── MAIO 2026 ─────────────────────────────────
  { id: 'r16', data: '2026-05-06', descricao: 'Consultoria TI – Grupo Alpha', categoria: 'Consultoria', tipo: 'receita', valor: 38000, formaPagamento: 'Transferência' },
  { id: 'r17', data: '2026-05-14', descricao: 'Desenvolvimento de software – Beta S.A.', categoria: 'Desenvolvimento', tipo: 'receita', valor: 30000, formaPagamento: 'Boleto' },
  { id: 'r18', data: '2026-05-20', descricao: 'Suporte técnico – Gama Ltda', categoria: 'Suporte', tipo: 'receita', valor: 9500, formaPagamento: 'Transferência' },
  { id: 'r19', data: '2026-05-22', descricao: 'Consultoria Épsilon TI', categoria: 'Consultoria', tipo: 'receita', valor: 15000, formaPagamento: 'Transferência' },
  { id: 'r20', data: '2026-05-28', descricao: 'Treinamento – Zeta Ind.', categoria: 'Treinamento', tipo: 'receita', valor: 8000, formaPagamento: 'Boleto' },
  { id: 'd24', data: '2026-05-05', descricao: 'Folha de pagamento – maio', categoria: 'Pessoal', tipo: 'despesa', valor: 42000, formaPagamento: 'Transferência' },
  { id: 'd25', data: '2026-05-05', descricao: 'Aluguel escritório', categoria: 'Infraestrutura', tipo: 'despesa', valor: 6500, formaPagamento: 'Débito automático' },
  { id: 'd26', data: '2026-05-12', descricao: 'Marketing digital', categoria: 'Marketing', tipo: 'despesa', valor: 4500, formaPagamento: 'Cartão de crédito' },
  { id: 'd27', data: '2026-05-15', descricao: 'ISS e impostos', categoria: 'Impostos', tipo: 'despesa', valor: 7537, formaPagamento: 'DARF' },
  { id: 'd28', data: '2026-05-25', descricao: 'Viagem – cliente RJ', categoria: 'Viagens', tipo: 'despesa', valor: 2200, formaPagamento: 'Cartão de crédito' },
  { id: 'd29', data: '2026-05-30', descricao: 'Contabilidade', categoria: 'Contabilidade', tipo: 'despesa', valor: 1800, formaPagamento: 'Transferência' },

  // ── JUNHO 2026 ────────────────────────────────
  { id: 'r21', data: '2026-06-05', descricao: 'Consultoria TI – Grupo Alpha', categoria: 'Consultoria', tipo: 'receita', valor: 38000, formaPagamento: 'Transferência' },
  { id: 'r22', data: '2026-06-12', descricao: 'Desenvolvimento de software – Beta S.A.', categoria: 'Desenvolvimento', tipo: 'receita', valor: 25000, formaPagamento: 'Boleto' },
  { id: 'r23', data: '2026-06-18', descricao: 'Suporte técnico – Gama Ltda', categoria: 'Suporte', tipo: 'receita', valor: 9500, formaPagamento: 'Transferência' },
  { id: 'r24', data: '2026-06-22', descricao: 'Consultoria Épsilon TI', categoria: 'Consultoria', tipo: 'receita', valor: 15000, formaPagamento: 'Transferência' },
  { id: 'd30', data: '2026-06-05', descricao: 'Folha de pagamento – junho', categoria: 'Pessoal', tipo: 'despesa', valor: 42000, formaPagamento: 'Transferência' },
  { id: 'd31', data: '2026-06-05', descricao: 'Aluguel escritório', categoria: 'Infraestrutura', tipo: 'despesa', valor: 6500, formaPagamento: 'Débito automático' },
  { id: 'd32', data: '2026-06-10', descricao: 'Licenças de software anuais', categoria: 'Tecnologia', tipo: 'despesa', valor: 4800, formaPagamento: 'Cartão de crédito' },
  { id: 'd33', data: '2026-06-15', descricao: 'ISS e impostos', categoria: 'Impostos', tipo: 'despesa', valor: 6562, formaPagamento: 'DARF' },
  { id: 'd34', data: '2026-06-30', descricao: 'Contabilidade', categoria: 'Contabilidade', tipo: 'despesa', valor: 1800, formaPagamento: 'Transferência' },

  // ── JULHO 2026 ────────────────────────────────
  { id: 'r25', data: '2026-07-07', descricao: 'Consultoria TI – Grupo Alpha', categoria: 'Consultoria', tipo: 'receita', valor: 32000, formaPagamento: 'Transferência' },
  { id: 'r26', data: '2026-07-15', descricao: 'Desenvolvimento de software – Beta S.A.', categoria: 'Desenvolvimento', tipo: 'receita', valor: 22000, formaPagamento: 'Boleto' },
  { id: 'r27', data: '2026-07-20', descricao: 'Suporte técnico – Gama Ltda', categoria: 'Suporte', tipo: 'receita', valor: 9500, formaPagamento: 'Transferência' },
  { id: 'r28', data: '2026-07-22', descricao: 'Consultoria Épsilon TI', categoria: 'Consultoria', tipo: 'receita', valor: 15000, formaPagamento: 'Transferência' },
  { id: 'd35', data: '2026-07-05', descricao: 'Folha de pagamento – julho', categoria: 'Pessoal', tipo: 'despesa', valor: 42000, formaPagamento: 'Transferência' },
  { id: 'd36', data: '2026-07-05', descricao: 'Aluguel escritório', categoria: 'Infraestrutura', tipo: 'despesa', valor: 6500, formaPagamento: 'Débito automático' },
  { id: 'd37', data: '2026-07-15', descricao: 'ISS e impostos', categoria: 'Impostos', tipo: 'despesa', valor: 5850, formaPagamento: 'DARF' },
  { id: 'd38', data: '2026-07-20', descricao: 'Marketing digital', categoria: 'Marketing', tipo: 'despesa', valor: 3000, formaPagamento: 'Cartão de crédito' },
  { id: 'd39', data: '2026-07-31', descricao: 'Contabilidade', categoria: 'Contabilidade', tipo: 'despesa', valor: 1800, formaPagamento: 'Transferência' },

  // ── AGOSTO 2026 ───────────────────────────────
  { id: 'r29', data: '2026-08-06', descricao: 'Consultoria TI – Grupo Alpha', categoria: 'Consultoria', tipo: 'receita', valor: 38000, formaPagamento: 'Transferência' },
  { id: 'r30', data: '2026-08-14', descricao: 'Desenvolvimento de software – Beta S.A.', categoria: 'Desenvolvimento', tipo: 'receita', valor: 30000, formaPagamento: 'Boleto' },
  { id: 'r31', data: '2026-08-20', descricao: 'Suporte técnico – Gama Ltda', categoria: 'Suporte', tipo: 'receita', valor: 9500, formaPagamento: 'Transferência' },
  { id: 'r32', data: '2026-08-22', descricao: 'Consultoria Épsilon TI', categoria: 'Consultoria', tipo: 'receita', valor: 15000, formaPagamento: 'Transferência' },
  { id: 'r33', data: '2026-08-27', descricao: 'Novo cliente – Eta Soluções', categoria: 'Consultoria', tipo: 'receita', valor: 12000, formaPagamento: 'Boleto' },
  { id: 'd40', data: '2026-08-05', descricao: 'Folha de pagamento – agosto', categoria: 'Pessoal', tipo: 'despesa', valor: 44000, formaPagamento: 'Transferência' },
  { id: 'd41', data: '2026-08-05', descricao: 'Aluguel escritório', categoria: 'Infraestrutura', tipo: 'despesa', valor: 6500, formaPagamento: 'Débito automático' },
  { id: 'd42', data: '2026-08-12', descricao: 'Contratação – consultor externo', categoria: 'Pessoal', tipo: 'despesa', valor: 5000, formaPagamento: 'Transferência' },
  { id: 'd43', data: '2026-08-15', descricao: 'ISS e impostos', categoria: 'Impostos', tipo: 'despesa', valor: 7912, formaPagamento: 'DARF' },
  { id: 'd44', data: '2026-08-20', descricao: 'Marketing digital', categoria: 'Marketing', tipo: 'despesa', valor: 4500, formaPagamento: 'Cartão de crédito' },
  { id: 'd45', data: '2026-08-31', descricao: 'Contabilidade', categoria: 'Contabilidade', tipo: 'despesa', valor: 1800, formaPagamento: 'Transferência' },

  // ── SETEMBRO 2026 ─────────────────────────────
  { id: 'r34', data: '2026-09-05', descricao: 'Consultoria TI – Grupo Alpha', categoria: 'Consultoria', tipo: 'receita', valor: 42000, formaPagamento: 'Transferência' },
  { id: 'r35', data: '2026-09-12', descricao: 'Desenvolvimento de software – Beta S.A.', categoria: 'Desenvolvimento', tipo: 'receita', valor: 32000, formaPagamento: 'Boleto' },
  { id: 'r36', data: '2026-09-18', descricao: 'Suporte técnico – Gama Ltda', categoria: 'Suporte', tipo: 'receita', valor: 9500, formaPagamento: 'Transferência' },
  { id: 'r37', data: '2026-09-22', descricao: 'Consultoria Épsilon TI', categoria: 'Consultoria', tipo: 'receita', valor: 15000, formaPagamento: 'Transferência' },
  { id: 'r38', data: '2026-09-25', descricao: 'Consultoria – Eta Soluções', categoria: 'Consultoria', tipo: 'receita', valor: 12000, formaPagamento: 'Transferência' },
  { id: 'd46', data: '2026-09-05', descricao: 'Folha de pagamento – setembro', categoria: 'Pessoal', tipo: 'despesa', valor: 44000, formaPagamento: 'Transferência' },
  { id: 'd47', data: '2026-09-05', descricao: 'Aluguel escritório', categoria: 'Infraestrutura', tipo: 'despesa', valor: 6500, formaPagamento: 'Débito automático' },
  { id: 'd48', data: '2026-09-15', descricao: 'ISS e impostos', categoria: 'Impostos', tipo: 'despesa', valor: 8475, formaPagamento: 'DARF' },
  { id: 'd49', data: '2026-09-20', descricao: 'Marketing digital', categoria: 'Marketing', tipo: 'despesa', valor: 5000, formaPagamento: 'Cartão de crédito' },
  { id: 'd50', data: '2026-09-25', descricao: 'Viagem – congresso de TI – BH', categoria: 'Viagens', tipo: 'despesa', valor: 3200, formaPagamento: 'Cartão de crédito' },
  { id: 'd51', data: '2026-09-30', descricao: 'Contabilidade', categoria: 'Contabilidade', tipo: 'despesa', valor: 1800, formaPagamento: 'Transferência' },

  // ── OUTUBRO 2026 ──────────────────────────────
  { id: 'r39', data: '2026-10-08', descricao: 'Consultoria TI – Grupo Alpha', categoria: 'Consultoria', tipo: 'receita', valor: 42000, formaPagamento: 'Transferência' },
  { id: 'r40', data: '2026-10-15', descricao: 'Desenvolvimento de software – Beta S.A.', categoria: 'Desenvolvimento', tipo: 'receita', valor: 28000, formaPagamento: 'Boleto' },
  { id: 'r41', data: '2026-10-22', descricao: 'Consultoria Épsilon TI', categoria: 'Consultoria', tipo: 'receita', valor: 15000, formaPagamento: 'Transferência' },
  { id: 'r42', data: '2026-10-25', descricao: 'Consultoria – Eta Soluções', categoria: 'Consultoria', tipo: 'receita', valor: 12000, formaPagamento: 'Transferência' },
  { id: 'd52', data: '2026-10-05', descricao: 'Folha de pagamento – outubro', categoria: 'Pessoal', tipo: 'despesa', valor: 44000, formaPagamento: 'Transferência' },
  { id: 'd53', data: '2026-10-05', descricao: 'Aluguel escritório', categoria: 'Infraestrutura', tipo: 'despesa', valor: 6500, formaPagamento: 'Débito automático' },
  { id: 'd54', data: '2026-10-15', descricao: 'ISS e impostos', categoria: 'Impostos', tipo: 'despesa', valor: 7387, formaPagamento: 'DARF' },
  { id: 'd55', data: '2026-10-20', descricao: 'Marketing digital', categoria: 'Marketing', tipo: 'despesa', valor: 4500, formaPagamento: 'Cartão de crédito' },
  { id: 'd56', data: '2026-10-31', descricao: 'Contabilidade', categoria: 'Contabilidade', tipo: 'despesa', valor: 1800, formaPagamento: 'Transferência' },
];

// ─── Compromissos ─────────────────────────────────────────────────────────────

export const COMPROMISSOS: Compromisso[] = [
  { id: 'cp01', descricao: 'Suporte técnico – Gama Ltda (out)', vencimento: '2026-11-05', valor: 9500, tipo: 'receber', status: 'pendente', categoria: 'Suporte' },
  { id: 'cp02', descricao: 'Folha de pagamento – novembro', vencimento: '2026-11-05', valor: 44000, tipo: 'pagar', status: 'pendente', categoria: 'Pessoal' },
  { id: 'cp03', descricao: 'Aluguel escritório – novembro', vencimento: '2026-11-05', valor: 6500, tipo: 'pagar', status: 'pendente', categoria: 'Infraestrutura' },
  { id: 'cp04', descricao: 'Consultoria TI – Alpha (nov)', vencimento: '2026-11-10', valor: 42000, tipo: 'receber', status: 'pendente', categoria: 'Consultoria' },
  { id: 'cp05', descricao: 'ISS novembro', vencimento: '2026-11-15', valor: 7000, tipo: 'pagar', status: 'pendente', categoria: 'Impostos' },
  { id: 'cp06', descricao: 'Desenvolvimento – Beta S.A. (nov)', vencimento: '2026-11-18', valor: 30000, tipo: 'receber', status: 'pendente', categoria: 'Desenvolvimento' },
  { id: 'cp07', descricao: 'Marketing digital – novembro', vencimento: '2026-11-20', valor: 4500, tipo: 'pagar', status: 'pendente', categoria: 'Marketing' },
  { id: 'cp08', descricao: 'Consultoria Épsilon TI (nov)', vencimento: '2026-11-22', valor: 15000, tipo: 'receber', status: 'pendente', categoria: 'Consultoria' },
  { id: 'cp09', descricao: 'Contabilidade – novembro', vencimento: '2026-11-28', valor: 1800, tipo: 'pagar', status: 'pendente', categoria: 'Contabilidade' },
  // Vencidos (atrasados)
  { id: 'cp10', descricao: 'Fatura cartão de crédito – outubro', vencimento: '2026-10-25', valor: 8200, tipo: 'pagar', status: 'atrasado', categoria: 'Cartão de crédito' },
  { id: 'cp11', descricao: 'Licença software – anual', vencimento: '2026-10-20', valor: 3600, tipo: 'pagar', status: 'atrasado', categoria: 'Tecnologia' },
];

// ─── Cálculos derivados ───────────────────────────────────────────────────────

const PERIODO_DASHBOARD = '2026-10'; // mês de referência

export function calcularDashboardMetrics(
  lancamentos: Lancamento[] = LANCAMENTOS,
  compromissos: Compromisso[] = COMPROMISSOS,
  mesReferencia: string = PERIODO_DASHBOARD
): DashboardMetrics {
  // KPIs do mês de referência
  const doMes = lancamentos.filter((l) => l.data.startsWith(mesReferencia));
  const receitaTotal = doMes
    .filter((l) => l.tipo === 'receita')
    .reduce((s, l) => s + l.valor, 0);
  const despesaTotal = doMes
    .filter((l) => l.tipo === 'despesa')
    .reduce((s, l) => s + l.valor, 0);
  const resultadoGerencial = receitaTotal - despesaTotal;
  const margemGerencial = receitaTotal > 0 ? (resultadoGerencial / receitaTotal) * 100 : 0;

  // Contas a pagar/receber (pendentes e atrasadas)
  const contasAPagar = compromissos
    .filter((c) => c.tipo === 'pagar' && c.status !== 'pago')
    .reduce((s, c) => s + c.valor, 0);
  const contasAReceber = compromissos
    .filter((c) => c.tipo === 'receber' && c.status !== 'recebido')
    .reduce((s, c) => s + c.valor, 0);

  // Dados mensais — jan/2026 até mês de referência (ordem cronológica)
  const meses: MonthlyData[] = [];
  const [refYear, refMonth] = mesReferencia.split('-').map(Number);
  for (let monthNum = 1; monthNum <= refMonth; monthNum++) {
    const mesISO = `${refYear}-${String(monthNum).padStart(2, '0')}`;
    const label = format(new Date(refYear, monthNum - 1, 1), 'MMM/yy', { locale: ptBR });
    const mLancamentos = lancamentos.filter((l) => l.data.startsWith(mesISO));
    const rec = mLancamentos.filter((l) => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0);
    const desp = mLancamentos.filter((l) => l.tipo === 'despesa').reduce((s, l) => s + l.valor, 0);
    if (rec === 0 && desp === 0) continue;
    const res = rec - desp;
    meses.push({
      mes: label,
      mesISO,
      receita: rec,
      despesa: desp,
      resultado: res,
      margem: rec > 0 ? (res / rec) * 100 : 0,
    });
  }

  // Composição de despesas por categoria (acumulado do ano até mês de referência)
  const despMap: Record<string, number> = {};
  lancamentos
    .filter((l) => l.tipo === 'despesa' && l.data <= mesReferencia + '-31')
    .forEach((l) => {
      despMap[l.categoria] = (despMap[l.categoria] ?? 0) + l.valor;
    });
  const despesasPorCategoria = Object.entries(despMap)
    .map(([categoria, valor]) => ({ categoria, valor }))
    .sort((a, b) => b.valor - a.valor);

  return {
    receitaTotal,
    despesaTotal,
    resultadoGerencial,
    margemGerencial,
    contasAPagar,
    contasAReceber,
    monthlyData: meses,
    despesasPorCategoria,
  };
}

export const CATEGORIAS_RECEITA = ['Consultoria', 'Desenvolvimento', 'Suporte', 'Treinamento'];
export const CATEGORIAS_DESPESA = ['Pessoal', 'Infraestrutura', 'Tecnologia', 'Impostos', 'Marketing', 'Contabilidade', 'Viagens', 'Cartão de crédito'];
export const FORMAS_PAGAMENTO = ['Transferência', 'Boleto', 'Cartão de crédito', 'DARF', 'Débito automático', 'Pix'];
export const MES_REFERENCIA = PERIODO_DASHBOARD;
