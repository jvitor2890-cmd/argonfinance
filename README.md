# ARGON — Dashboard Financeiro Gerencial

Painel de apresentação financeira para reuniões com clientes de BPO. **Dados fictícios**, sem backend ou banco de dados — apenas estado local no browser.

> ⚠️ **Modo Demonstração** — Nenhum dado real é armazenado. Alterações são perdidas ao fechar a aba.

---

## Páginas disponíveis

| Rota | Descrição |
|------|-----------|
| `/dashboard` | KPIs do mês, gráficos de receita × despesa e composição |
| `/lancamentos` | Tabela de receitas e despesas com filtros, add/edit/delete |
| `/contas` | Contas a pagar e receber, status de compromissos, atrasos |
| `/dre` | DRE Gerencial por competência com seletor de mês |
| `/simulador` | Simulador de cenários com sliders em tempo real |

---

## Rodar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000` — redireciona automaticamente para `/dashboard`.

---

## Deploy no Vercel

### 1. Subir o código para o GitHub

```bash
git init
git add .
git commit -m "feat: ARGON Dashboard Financeiro - Etapas 1-5"
git remote add origin https://github.com/SEU_USUARIO/argon-dashboard.git
git push -u origin main
```

### 2. Criar projeto no Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login (pode usar conta do GitHub)
2. Clique em **Add New → Project**
3. Selecione o repositório `argon-dashboard`
4. Configurações de build (já detectadas automaticamente pelo Vercel):
   - **Framework**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Clique em **Deploy**

> Não são necessárias variáveis de ambiente — o projeto não usa backend.

### 3. Domínio personalizado (opcional)

No painel do Vercel → Settings → Domains → adicione seu domínio.

---

## Trocar os dados de demonstração

Todos os dados fictícios estão em um único arquivo:

```
src/lib/demo-data.ts
```

- **`LANCAMENTOS`** — 98 lançamentos Jan–Out 2026 (Nexus Consultoria & Tecnologia)
- **`COMPROMISSOS`** — 11 compromissos futuros (Nov 2026 + 2 atrasados)
- **`CATEGORIAS_RECEITA / CATEGORIAS_DESPESA`** — listas de categorias
- **`PERIODO_DASHBOARD`** — mês de referência do dashboard (`'2026-10'`)

Para adaptar ao cliente real: substitua os dados em `LANCAMENTOS` e `COMPROMISSOS` mantendo a mesma estrutura de tipos (`src/types/index.ts`).

---

## Stack

| Tecnologia | Uso |
|-----------|-----|
| Next.js 14 (App Router) | Framework React |
| TypeScript | Tipagem estática |
| Tailwind CSS | Estilização |
| Recharts | Gráficos |
| Lucide React | Ícones |
| date-fns | Formatação de datas |

---

## Segurança e conformidade LGPD

- Nenhum dado real de cliente é utilizado
- Nenhuma informação bancária ou documento confidencial é armazenado
- Não há autenticação implementada (demonstração pública)
- O resultado gerencial é diferenciado do saldo bancário em todas as telas
- Nota de conformidade exibida no DRE e no Dashboard
