# Conciliação Bancária — Instruções de Deploy

## 1. Aplicar a Migração SQL no Supabase

Acesse **Supabase → SQL Editor** e execute o conteúdo do arquivo `migration.sql`
(na raiz do workspace de integração). Ele cria:

- `extrato_contas` — contas bancárias por empresa
- `extrato_itens` — itens importados (OFX/CSV) com status de conciliação
- `conciliacao_regras` — regras keyword→categoria
- `conciliacao_log` — auditoria completa
- `conciliacao_fechamentos` — controle de meses fechados

Todas as tabelas têm RLS habilitado com policy `service_role`.

---

## 2. Arquivos já integrados neste repositório

| Arquivo | Descrição |
|---------|-----------|
| `src/components/layout/Sidebar.tsx` | ✅ Atualizado — adicionado item "Conciliação" com ícone Landmark |
| `src/app/conciliacao/page.tsx` | ✅ Novo — página principal com AppShell + useEmpresa |
| `src/lib/conciliacao/types.ts` | ✅ Novo — interfaces TypeScript |
| `src/lib/conciliacao/matching.ts` | ✅ Novo — algoritmo de matching (score-based) |
| `src/lib/conciliacao/ofx-parser.ts` | ✅ Novo — parser OFX 1.x (SGML) e 2.x (XML) |
| `src/lib/conciliacao/csv-parser.ts` | ✅ Novo — parser CSV com SHA-256 para deduplicação |
| `src/lib/conciliacao/index.ts` | ✅ Novo — barrel re-export |
| `src/app/api/conciliacao/importar/route.ts` | ✅ Novo — POST import OFX/CSV |
| `src/app/api/conciliacao/extrato/route.ts` | ✅ Novo — GET itens do extrato |
| `src/app/api/conciliacao/lancamentos/route.ts` | ✅ Novo — GET lançamentos do mês |
| `src/app/api/conciliacao/contas/route.ts` | ✅ Novo — GET/POST contas bancárias |
| `src/app/api/conciliacao/casar/route.ts` | ✅ Novo — POST/DELETE conciliar item |
| `src/app/api/conciliacao/ignorar/route.ts` | ✅ Novo — POST ignorar item |
| `src/app/api/conciliacao/sugestoes/route.ts` | ✅ Novo — GET sugestões de match |
| `src/app/api/conciliacao/criar-lancamento/route.ts` | ✅ Novo — POST criar lançamento a partir do extrato |
| `src/app/api/conciliacao/regras/route.ts` | ✅ Novo — GET/POST/DELETE regras de categoria |
| `src/app/api/conciliacao/fechar-mes/route.ts` | ✅ Novo — POST fechar mês |
| `src/components/conciliacao/PainelSaldo.tsx` | ✅ Novo — painel de saldo com barra de progresso |
| `src/components/conciliacao/TabelaExtrato.tsx` | ✅ Novo — coluna esquerda |
| `src/components/conciliacao/TabelaLancamentos.tsx` | ✅ Novo — coluna direita com botão Casar |
| `src/components/conciliacao/ModalImportar.tsx` | ✅ Novo — upload OFX/CSV com aviso LGPD |
| `src/components/conciliacao/ModalSugestoes.tsx` | ✅ Novo — sugestões com score bar |
| `src/components/conciliacao/ModalCriarLancamento.tsx` | ✅ Novo — criar lançamento a partir do extrato |
| `src/components/conciliacao/RegrasCategoria.tsx` | ✅ Novo — CRUD de regras keyword→categoria |

---

## 3. Passos após aplicar a migração

```bash
# Instalar dependências (já incluídas no package.json do projeto)
# Nenhuma dependência nova é necessária

# Rodar o projeto normalmente
npm run dev
```

Acesse: **http://localhost:3000/conciliacao**

---

## 4. Fluxo de uso

1. Selecione a empresa no menu lateral (dropdown padrão do ARGON)
2. Na tela Conciliação, selecione ou crie uma conta bancária
3. Escolha o mês
4. Clique em **Importar Extrato** → selecione arquivo `.ofx` ou `.csv`
5. Os itens aparecem na coluna esquerda; lançamentos do sistema na direita
6. Para cada item pendente:
   - Clique **Ver sugestões** → veja matches automáticos com score
   - Ou **Criar lançamento** → preencha e concilie em um clique
   - Ou **Ignorar** → remove da conciliação sem apagar
7. Quando diferença for R$ 0,00 e 0 itens pendentes → botão **Fechar mês** ativa

---

## 5. Formato dos arquivos OFX

Testado com:
- **Banco do Brasil**: SGML 1.x sem `</STMTTRN>` e timezone `[-3:BRT]`
- **Bradesco**: SGML 1.x padrão
- **Cora**: OFX 2.x (XML)
- **Itaú/Santander/Nubank**: OFX 1.x ou 2.x padrão

## 6. Formato CSV

Layouts pré-configurados: `csvConfigBB`, `csvConfigBradesco`, `csvConfigCora`.
Para outros bancos, o layout "Outro" tenta um parser genérico com fallback.

---

## 7. Segurança (LGPD)

- Todo processamento ocorre no servidor ARGON (Node.js / API Routes)
- Nenhum dado de extrato é enviado a serviços externos de IA
- Aviso LGPD exibido na tela de importação
- Deduplicação por FITID (OFX) ou SHA-256 (CSV) — sem duplicatas

---

## 8. Testes

Os testes unitários estão em `__tests__/conciliacao/` (no workspace de integração).
Para rodar no projeto final, copie também:
- `__tests__/conciliacao/matching.test.ts`
- `__tests__/conciliacao/parsers.test.ts`
- `vitest.config.ts`

```bash
npx vitest run
```
