import type { Company } from "@/types/domain";

/**
 * Portfólio real da Ore (site institucional).
 *
 * Sprint 1.4 · B-01 — `onboardingStep` foi ESVAZIADO em todas as investidas.
 * Descrevia um onboarding de integração ("De-para do plano de contas · etapa 3
 * de 5") com go-live estimado para ago/2026 — etapa, atraso e prazo que a ORE
 * nunca confirmou, desenhados como barra de progresso na Home. O campo segue no
 * contrato (`types/domain.ts`) para quando houver implantação real a acompanhar.
 *
 * `integrationStatus` permanece preenchido e DELIBERADAMENTE não renderizado:
 * ver a nota do campo em `types/domain.ts`. Quem responde ao usuário é
 * `dataStatus`.
 *
 * Fase 5.2 · ORE-51-001 — as seis investidas passam a `REAL`. Não é afrouxamento
 * do critério: desde a Sprint 1.5 os documentos da Ore sustentam, para TODAS,
 * capital investido, valor justo, participação, série trimestral, cenários de
 * saída e mapa estratégico. Manter cinco delas no estado anterior fazia a tela
 * afirmar algo falso — "sem fonte documental disponibilizada" — sobre dados que
 * vieram de documento.
 * O que varia entre elas é a cobertura POR MÓDULO, e isso é respondido pela
 * tabela de cobertura (`@modules/organizations` · `getCobertura`), não por um
 * único selo de investida.
 */
export const companies: Company[] = [
  {
    id: "c-ativa",
    slug: "ativa-mineracao",
    /* Fase 5.1 — nome oficial confirmado pelos documentos: "Ativa Mineração"
       (workbook · Base de Dados A18 e KPI Ativa; Q4/2025 p.9 e p.11; Q1/2026
       p.10 e p.12). "Ativa Titânio e Vanádio" não aparece em nenhum deles e
       divergia do nome usado em breadcrumb, sidebar e módulos.
       O SLUG `ativa-mineracao` já estava correto e NÃO foi alterado — mexer
       nele quebraria rotas em uso. */
    name: "Ativa Mineração",
    shortName: "Ativa Mineração",
    commodity: "Ti-V",
    region: "Pernambuco",
    /* Sprint 1.5 — era 62%, sem fonte. Os documentos registram 60,00% em
       quatro pontos independentes: workbook (Base de Dados D18 e KPI Ativa
       C10), Q4/2025 p.11 e Q1/2026 p.12. */
    ownershipPct: 60,
    investedSince: "2022",
    integrationStatus: "integrated",
    /* Workbook de gestão + forecast operacional sustentam Estratégia,
       Performance e Valuation. Cobertura por módulo em `getCobertura`. */
    dataStatus: "REAL",
    alerts: 2,
    /* Sprint 1.5 · AUD-001 — `kpis` e `cashSpark` REMOVIDOS.
       Traziam caixa R$ 48,2 mi, receita R$ 18,9 mi e desvio OxR -5,2% para a
       Ativa. Busca exaustiva nos quatro documentos da ORE: NENHUM atribui
       caixa, receita ou EBITDA à Ativa. O único saldo próximo é o do FUNDO
       (USD 1.679k em 31/12/2025), que não é da investida e não pode preenchê-la.
       Receita da Ativa só existe como PROJEÇÃO a plena capacidade (USD 40M/ano,
       Q4 p.16 / Q1 p.17) — projeção não é realizado.
       Sem `kpis`, o card exibe a ausência em vez de números sem fonte. */
  },
  {
    id: "c-nazareno",
    slug: "nazareno-gold",
    name: "Nazareno Gold",
    shortName: "Nazareno",
    commodity: "Au",
    region: "Minas Gerais",
    ownershipPct: 52.98,
    investedSince: "2021",
    integrationStatus: "implementing",
    /* Fase 5.2 — documentos da Ore sustentam Estratégia, Performance e
       Valuation. Financeiro e Caixa seguem aguardando dados. */
    dataStatus: "REAL",
    alerts: 0,
  },
  {
    id: "c-morroverde",
    slug: "morro-verde",
    name: "Morro Verde Fertilizantes",
    shortName: "Morro Verde",
    commodity: "P",
    region: "Triângulo Mineiro, MG",
    ownershipPct: 42.36,
    investedSince: "2023",
    integrationStatus: "implementing",
    /* Fase 5.2 — documentos da Ore sustentam Estratégia, Performance e
       Valuation. Financeiro e Caixa seguem aguardando dados. */
    dataStatus: "REAL",
    alerts: 0,
  },
  {
    id: "c-rionovo",
    slug: "rio-novo",
    name: "Rio Novo Cobre e Ouro",
    shortName: "Rio Novo",
    commodity: "Cu-Au",
    region: "Carajás, PA",
    ownershipPct: 100,
    investedSince: "2021",
    integrationStatus: "not_integrated",
    /* Fase 5.2 — documentos da Ore sustentam Estratégia, Performance e
       Valuation. Financeiro e Caixa seguem aguardando dados. */
    dataStatus: "REAL",
    alerts: 0,
  },
  {
    id: "c-alvo",
    slug: "alvo-minerals",
    name: "Alvo Minerals",
    shortName: "Alvo",
    commodity: "ETR",
    region: "Goiás e Tocantins",
    /* CONFLITO-03 — os documentos divergem sem explicação: 9,56% (Q4 p.11 e
       Q1 p.12) × 19,9% (AGM p.49, que ainda se compara a "8,2% no 2Q26").
       Sem base para eleger um valor (D4): `null` e a tela declara a ausência. */
    ownershipPct: null,
    investedSince: "2024",
    integrationStatus: "not_integrated",
    /* Fase 5.2 — documentos da Ore sustentam Estratégia, Performance e
       Valuation. Financeiro e Caixa seguem aguardando dados. */
    dataStatus: "REAL",
    alerts: 0,
  },
  {
    id: "c-neeo",
    slug: "neeo-exploration",
    name: "Neeo Exploration",
    shortName: "Neeo",
    commodity: "Poli",
    region: "Nordeste e Centro-Oeste",
    ownershipPct: 100,
    investedSince: "2022",
    integrationStatus: "not_integrated",
    /* Fase 5.2 — documentos da Ore sustentam Estratégia, Performance e
       Valuation. Financeiro e Caixa seguem aguardando dados. */
    dataStatus: "REAL",
    alerts: 0,
  },
];

export const getCompany = (slug: string) => companies.find((c) => c.slug === slug);
export const integratedCount = companies.filter((c) => c.integrationStatus === "integrated").length;
