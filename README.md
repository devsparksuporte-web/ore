# Plataforma de Inteligência e Governança Corporativa — Front-end

Front-end da Fase 4 do projeto (docs 01–12 na pasta pai). **Dados 100% mockados** — nenhum backend necessário.

## Rodar localmente

```bash
npm install
npm run dev
# abre http://localhost:3000 → login (qualquer credencial válida) → selecionar contexto
npm run typecheck   # verificação de tipos
npm run build       # build de produção
```

Requisitos: Node 18.17+.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind (tokens Strata do doc 02) · shadcn/ui (Radix, customizado) · Recharts · react-hook-form + zod · framer-motion · lucide-react · sonner (toasts).

Fontes: **Inter** (UI/números) + **Montserrat** (títulos — fallback aprovado da Gotham até confirmação da licença web; trocar em `src/app/layout.tsx`).

## Estrutura

```
src/
├── app/                  # rotas (espelha o sitemap do doc 01)
│   ├── login, selecionar-contexto
│   └── (app)/            # shell logado (sidebar + topbar)
│       ├── portfolio/    # contexto Portfólio Ore (overview, investidas)
│       ├── e/[empresa]/  # contexto Empresa (Ativa): overview, financeiro/(fluxo-de-caixa, dre, oxr),
│       │                 # operacoes/compras, governanca/(aprovacoes, auditoria),
│       │                 # config/(integracoes, de-para, periodos)
│       ├── admin/usuarios
│       └── notificacoes
├── components/
│   ├── ui/               # primitivos shadcn customizados (button, card, sheet, dialog, tabs…)
│   ├── data/             # componentes Strata: KpiCard, DataTable, FinancialTable, EntityCard,
│   │                     # DeltaIndicator, EmptyState, ApprovalTimeline, ChartCard…
│   ├── charts/           # wrappers Recharts com convenções do DS (cash, waterfall, forecast, heatmap)
│   └── shell/            # Sidebar, Topbar, ContextSwitcher, Breadcrumb, FilterBar, PageHeader
├── mocks/                # dados mockados por módulo (companies, financeiro, operacoes, governanca, plataforma)
├── lib/                  # utils, formatadores financeiros pt-BR, sessão mock (contrato do futuro /me)
└── types/                # tipos de domínio (espelham o Data Dictionary, doc 11)
```

## O que está implementado (v1 mockada)

- **Navegação completa** entre contextos: Portfólio Ore ⇄ Ativa Mineração (ContextSwitcher padrão Stripe, breadcrumb com linhagem `Ore / Investidas / Ativa / …`).
- **Home Ore**: contagens, cards das 6 investidas reais em 3 estados, alertas acionáveis, feed, integrações, marcos, mini-funil do pipeline, badge de escopo "1 empresa" nos consolidados.
- **Dashboard Ativa**: 6 KPIs executivos com drill, gráfico âncora de caixa (realizado + projetado + caixa mínimo), waterfall OxR + top 5 desvios, DRE resumida, forecast, KPIs operacionais de mineração, tabs Compras/CAPEX, "Minhas Pendências".
- **Fluxo de Caixa**: tabs Realizado/Movimentos/Premissas, drawer de título com linhagem.
- **DRE**: hierarquia colapsável (FinancialTable), banner de contas não mapeadas ⇄ de-para, drill até lançamentos em drawer.
- **OxR**: matriz com semáforo e filtro de limiar, heatmap divergente, waterfall, **justificativa de desvio** (react-hook-form + zod, causa/descrição/plano).
- **Compras**: funil, pedidos com aging, fornecedores com concentração, drawer com **contexto orçamentário** e timeline de aprovação.
- **Aprovações**: fila multi-tipo, decisão com **desfazer de 10s**, reprovação com comentário obrigatório, **lote com exclusão de itens fora da alçada**, drawer de contexto.
- **Auditoria**: trilha com diff antes/depois expansível.
- **Integrações**: cards por conector, sync manual com progresso, logs, desconexão destrutiva explícita.
- **De-Para**: grade com sugestões automáticas e progresso 218/230.
- **Períodos**: publicação com confirmação digitada "PUBLICAR" (snapshot imutável).
- **Admin**: usuários + convite com papel/escopo. **Notificações**: central completa.
- Estados: skeleton page, vazios (3 tipos), semântica favorável/desfavorável em todos os deltas.

## Próximos passos (Fase 5+)

Substituir `src/mocks` por chamadas à API NestJS (contratos no doc 10 §A3/doc 09) — os componentes já consomem tipos de domínio, então a troca é na camada de dados, não na UI. Itens sinalizados com toast "v1.1/Fase 3" no produto: CAPEX completo, Forecast completo, Balanço, documentos, pipeline kanban, ⌘K real, modo apresentação.
