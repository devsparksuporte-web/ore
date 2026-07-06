# Crystal — Arquitetura Modular por Domínio (Sprint 2 · ADR-017)

Front-end organizado em **módulos de domínio independentes**, espelhando os módulos de produto (docs/04-modules). Regras vinculantes (fiscalizadas por ESLint):

## Estrutura de cada módulo

```
modules/<dominio>/
├── index.ts        # ÚNICA porta de entrada (interface pública do módulo)
├── components/     # componentes exclusivos do domínio
├── hooks/          # hooks do domínio (E5: consomem services via TanStack Query)
├── types/          # tipos do domínio (o que for público, re-exportado no index)
├── services/       # PORTS: contratos de dados do domínio + adaptador vigente
├── pages/          # corpos de página (app/ contém apenas shims de rota)
└── utils/          # utilitários internos do domínio
```

## Regras de dependência

1. **Módulo → módulo: proibido importar internals.** Só `@modules/<x>` (o barrel). Deep import (`@modules/x/services/...`) falha o lint.
2. **Todos podem depender de `@core`** (design system, utils, tipos base). `@core` não depende de nenhum módulo.
3. **`app/` (rotas Next) é camada fina:** compõe páginas importando dos barrels; nenhuma regra de negócio.
4. **`src/mocks` é detalhe do adaptador atual:** somente `modules/*/services` podem importá-lo. Páginas nunca (violações legadas = warning + DT-015).
5. **Trocar mock→API real (E5) = trocar o adaptador dentro de `services/`** — consumidores (hooks/páginas) não mudam.
6. Módulo novo = nova pasta com este contrato. Nenhuma alteração na arquitetura existente.

## Mapa de domínios → módulos de produto

| Módulo front | Produto (doc 04) | Conteúdo |
|---|---|---|
| `core` | M00 | UI primitives (shadcn Strata), format, cn, tipos base |
| `analytics` | dataviz | Gráficos + primitivos premium (tokens, tooltip, legenda) |
| `widgets` | dataviz | Cards de dados: Kpi, Chart, Entity, Delta, Sparkline, Empty… |
| `organizations` | M14 | Portfólio/tenant: home da holding, investidas |
| `companies` | M00/M01 | Contexto empresa, dashboard executivo |
| `financials` | M02–M04 | Caixa, DRE, OxR (dono dos dados financeiros) |
| `operations` | M05 | Compras, fornecedores |
| `governance` | M06/M13 | Aprovações, auditoria, períodos, alertas, feed |
| `users` | M08 | Sessão, usuários, convites |
| `permissions` | M08 | Capacidades, `can()` — RBAC |
| `notifications` | M15 | Central e preferências |
| `settings` | M07/M09 | Integrações, de-para |
| `insights` | ADR-020 | Insight Engine: indicadores → linguagem executiva (regras v1, port AI-ready) |
| `api` | E5 | Port do cliente HTTP (adaptador real na E5) |
