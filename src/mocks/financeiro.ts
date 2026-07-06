import type { CashPoint, CashTitle, DreLine, KpiData, OxrLine } from "@/types/domain";

/* ── KPIs do Dashboard Ativa (doc 04 §3) ─────────────────────────── */
export const ativaKpis: KpiData[] = [
  {
    key: "cash", label: "Caixa disponível", value: "R$ 48,2 mi",
    subMetric: "4,2 meses de operação",
    delta: { value: 6.4, label: "vs mai", favorable: true },
    spark: [39.5, 41.2, 40.1, 43.8, 45.3, 48.2],
    href: "financeiro/fluxo-de-caixa", source: "Protheus · hoje 06:15",
  },
  {
    key: "revenue", label: "Receita (mês)", value: "R$ 18,9 mi",
    subMetric: "YTD R$ 112,7 mi",
    delta: { value: -3.1, label: "vs orçado", favorable: false },
    spark: [17.2, 18.8, 19.5, 18.1, 19.6, 18.9],
    href: "financeiro/dre", source: "Protheus · publicado jun/26",
  },
  {
    key: "ebitda", label: "EBITDA (mês)", value: "R$ 5,4 mi",
    subMetric: "margem 28,6%",
    delta: { value: -1.8, label: "p.p. vs orçado", favorable: false },
    spark: [5.9, 6.1, 5.8, 5.2, 5.6, 5.4],
    href: "financeiro/dre", source: "DRE gerencial · jun/26",
  },
  {
    key: "costs", label: "Custos operacionais (mês)", value: "R$ 11,2 mi",
    subMetric: "R$ 78,90/t",
    delta: { value: 10.4, label: "vs orçado", favorable: false },
    spark: [9.8, 10.1, 10.4, 10.9, 11.0, 11.2],
    href: "financeiro/oxr", source: "Protheus · jun/26",
  },
  {
    key: "capex", label: "Execução CAPEX (ano)", value: "R$ 14,1 mi",
    subMetric: "de R$ 32,0 mi aprovados · 44%",
    href: "operacoes/compras", badge: "meta 62%", source: "Projetos · jun/26",
  },
  {
    key: "approvals", label: "Compras pendentes", value: "7 aprovações",
    subMetric: "R$ 2,3 mi em valor",
    badge: "2 há +5 dias",
    href: "governanca/aprovacoes", source: "Fila de aprovações",
  },
];

/* ── Fluxo de caixa (semanal; projetado após "hoje") ─────────────── */
export const cashFlow: CashPoint[] = [
  { label: "S18", inflow: 5.1, outflow: 3.9, balance: 43.8 },
  { label: "S19", inflow: 4.2, outflow: 4.6, balance: 43.4 },
  { label: "S20", inflow: 6.3, outflow: 4.1, balance: 45.6 },
  { label: "S21", inflow: 3.8, outflow: 4.2, balance: 45.2 },
  { label: "S22", inflow: 5.9, outflow: 3.4, balance: 47.7 },
  { label: "S23", inflow: 4.1, outflow: 3.6, balance: 48.2 },
  { label: "S24", inflow: 3.2, outflow: 5.8, balance: 45.6, projected: true },
  { label: "S25", inflow: 4.8, outflow: 4.3, balance: 46.1, projected: true },
  { label: "S26", inflow: 2.9, outflow: 6.2, balance: 42.8, projected: true },
  { label: "S27", inflow: 5.4, outflow: 4.0, balance: 44.2, projected: true },
];
export const CASH_MINIMUM = 20; // R$ mi — linha de segurança configurável

export const bankAccounts = [
  { bank: "Itaú BBA", balance: 21_400_000, pct: 44 },
  { bank: "Santander", balance: 14_100_000, pct: 29 },
  { bank: "Banco do Brasil", balance: 9_300_000, pct: 19 },
  { bank: "BNB", balance: 3_400_000, pct: 8 },
];

export const upcomingOutflows = [
  { id: "t-1", who: "Enel Distribuição PE", what: "Energia — planta", due: "05/07", amount: 1_840_000 },
  { id: "t-2", who: "Folha de pagamento", what: "Salários jun/26", due: "05/07", amount: 3_120_000 },
  { id: "t-3", who: "Transportadora Rota Norte", what: "Frete concentrado", due: "08/07", amount: 940_000 },
  { id: "t-4", who: "MinerParts Ltda", what: "Peças moinho — PC-2214", due: "12/07", amount: 720_000 },
  { id: "t-5", who: "SEFAZ-PE", what: "ICMS jun/26", due: "15/07", amount: 1_260_000 },
];

export const cashTitles: CashTitle[] = [
  { id: "ct-01", kind: "receivable", counterparty: "TitanTrade GmbH", document: "NF 8841", dueDate: "2026-07-04", amount: 4_620_000, bankAccount: "Itaú BBA", status: "open", nature: "Venda concentrado TiO₂" },
  { id: "ct-02", kind: "payable", counterparty: "Enel Distribuição PE", document: "FAT 220148", dueDate: "2026-07-05", amount: 1_840_000, bankAccount: "Itaú BBA", status: "open", nature: "Energia elétrica" },
  { id: "ct-03", kind: "payable", counterparty: "Folha de pagamento", document: "FL 06/26", dueDate: "2026-07-05", amount: 3_120_000, bankAccount: "Santander", status: "open", nature: "Pessoal" },
  { id: "ct-04", kind: "receivable", counterparty: "VanadiumCo Trading", document: "NF 8853", dueDate: "2026-07-10", amount: 2_180_000, bankAccount: "Itaú BBA", status: "open", nature: "Venda V₂O₅" },
  { id: "ct-05", kind: "payable", counterparty: "Transportadora Rota Norte", document: "CTE 44712", dueDate: "2026-07-08", amount: 940_000, bankAccount: "BB", status: "open", nature: "Frete", orderRef: "PC-2198" },
  { id: "ct-06", kind: "payable", counterparty: "MinerParts Ltda", document: "NF 5521", dueDate: "2026-07-12", amount: 720_000, bankAccount: "Itaú BBA", status: "open", nature: "Manutenção", orderRef: "PC-2214" },
  { id: "ct-07", kind: "payable", counterparty: "SEFAZ-PE", document: "GNRE 06/26", dueDate: "2026-07-15", amount: 1_260_000, bankAccount: "BB", status: "open", nature: "Impostos" },
  { id: "ct-08", kind: "receivable", counterparty: "TitanTrade GmbH", document: "NF 8790", dueDate: "2026-06-28", amount: 4_410_000, bankAccount: "Itaú BBA", status: "settled", nature: "Venda concentrado TiO₂" },
  { id: "ct-09", kind: "payable", counterparty: "Reagentes Nordeste", document: "NF 3310", dueDate: "2026-06-30", amount: 486_000, bankAccount: "Santander", status: "settled", nature: "Insumos", orderRef: "PC-2187" },
  { id: "ct-10", kind: "payable", counterparty: "Locadora HeavyMaq", document: "FAT 0912", dueDate: "2026-07-20", amount: 1_150_000, bankAccount: "Itaú BBA", status: "open", nature: "Locação de equipamentos", orderRef: "PC-2201" },
];

/* ── DRE hierárquica (valores em R$ mil, jun/26) ─────────────────── */
export const dreTree: DreLine[] = [
  {
    id: "receita", label: "Receita líquida", level: 0, actual: 18_900, budget: 19_500,
    children: [
      { id: "rec-tio2", label: "Concentrado TiO₂", level: 1, actual: 13_200, budget: 13_600 },
      { id: "rec-v2o5", label: "V₂O₅", level: 1, actual: 5_100, budget: 5_400 },
      { id: "rec-outras", label: "Outras receitas", level: 1, actual: 600, budget: 500 },
    ],
  },
  {
    id: "custos", label: "(−) Custos operacionais", level: 0, actual: -11_200, budget: -10_150,
    children: [
      { id: "c-pessoal", label: "Pessoal e encargos", level: 1, actual: -3_150, budget: -3_050 },
      { id: "c-energia", label: "Energia elétrica", level: 1, actual: -1_980, budget: -1_600 },
      { id: "c-manut", label: "Manutenção", level: 1, actual: -1_890, budget: -1_500 },
      { id: "c-insumos", label: "Insumos e reagentes", level: 1, actual: -2_240, budget: -2_100 },
      { id: "c-frete", label: "Frete e logística", level: 1, actual: -1_420, budget: -1_300 },
      { id: "c-outros", label: "Outros custos", level: 1, actual: -520, budget: -600 },
    ],
  },
  { id: "lucro-bruto", label: "Lucro bruto", level: 0, isTotal: true, actual: 7_700, budget: 9_350 },
  {
    id: "despesas", label: "(−) Despesas operacionais", level: 0, actual: -2_300, budget: -2_450,
    children: [
      { id: "d-adm", label: "Administrativas", level: 1, actual: -1_450, budget: -1_500 },
      { id: "d-com", label: "Comerciais", level: 1, actual: -520, budget: -600 },
      { id: "d-ti", label: "TI e sistemas", level: 1, actual: -330, budget: -350 },
    ],
  },
  { id: "ebitda", label: "EBITDA", level: 0, isTotal: true, actual: 5_400, budget: 6_900 },
  { id: "dep", label: "(−) Depreciação e amortização", level: 0, actual: -1_650, budget: -1_650 },
  { id: "fin", label: "(−) Resultado financeiro", level: 0, actual: -820, budget: -760 },
  { id: "resultado", label: "Resultado do período", level: 0, isTotal: true, actual: 2_930, budget: 4_490 },
];

export const UNMAPPED_ACCOUNTS = 12;

/* ── OxR (valores R$ mil; monthly = desvio % jan–jun) ────────────── */
export const oxrLines: OxrLine[] = [
  { id: "o1", label: "Energia elétrica", costCenter: "310 · Planta", budget: 1_600, actual: 1_980, justification: "pending", assignee: "R. Meireles", monthly: [2.1, 4.5, 8.2, 12.4, 18.9, 23.8] },
  { id: "o2", label: "Manutenção", costCenter: "320 · Manutenção", budget: 1_500, actual: 1_890, justification: "submitted", assignee: "C. Duarte", monthly: [5.5, 9.1, 14.2, 19.8, 22.1, 26.0] },
  { id: "o3", label: "Insumos e reagentes", costCenter: "310 · Planta", budget: 2_100, actual: 2_240, justification: "accepted", assignee: "R. Meireles", monthly: [1.2, 2.8, 3.1, 4.4, 5.9, 6.7] },
  { id: "o4", label: "Frete e logística", costCenter: "410 · Logística", budget: 1_300, actual: 1_420, justification: "pending", assignee: "P. Lopes", monthly: [-1.4, 2.2, 4.8, 6.1, 7.9, 9.2] },
  { id: "o5", label: "Pessoal e encargos", costCenter: "100 · Corporativo", budget: 3_050, actual: 3_150, justification: null, monthly: [0.8, 1.1, 1.9, 2.4, 2.9, 3.3] },
  { id: "o6", label: "Receita TiO₂", costCenter: "— · Comercial", budget: 13_600, actual: 13_200, justification: "submitted", assignee: "E. Cardoso", monthly: [-0.9, -1.4, -2.1, -2.5, -2.8, -2.9] },
  { id: "o7", label: "Despesas administrativas", costCenter: "100 · Corporativo", budget: 1_500, actual: 1_450, justification: null, monthly: [-2.2, -1.8, -2.4, -3.1, -3.0, -3.3] },
];

/* ── Waterfall OxR: EBITDA orçado → realizado (R$ mi) ────────────── */
export const oxrWaterfall = [
  { name: "EBITDA orçado", value: 6.9, kind: "pillar" as const },
  { name: "Receita", value: -0.6, kind: "delta" as const },
  { name: "Energia", value: -0.38, kind: "delta" as const },
  { name: "Manutenção", value: -0.39, kind: "delta" as const },
  { name: "Insumos", value: -0.14, kind: "delta" as const },
  { name: "Outros", value: 0.01, kind: "delta" as const },
  { name: "EBITDA realizado", value: 5.4, kind: "pillar" as const },
];

/* ── Indicadores operacionais (mineração — catálogo Ativa) ───────── */
export const operationalKpis = [
  { label: "Produção ROM", value: "142 kt", delta: 3, favorable: true, note: "vs meta" },
  { label: "Concentrado TiO₂/V₂O₅", value: "18,4 kt", delta: -2, favorable: false, note: "vs meta" },
  { label: "Teor médio alimentado", value: "4,8%", delta: 0, favorable: true, note: "na meta" },
  { label: "Custo por tonelada", value: "R$ 78,90/t", delta: 6, favorable: false, note: "vs orçado" },
  { label: "Disponibilidade física", value: "91,2%", delta: 1.1, favorable: true, note: "p.p. vs meta" },
  { label: "Dias sem acidente", value: "312", delta: 0, favorable: true, note: "SSMA" },
];

/* ── Forecast (EBITDA, R$ mi/mês) ────────────────────────────────── */
export const forecastSeries = Array.from({ length: 12 }, (_, i) => {
  const month = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"][i];
  const actual = i < 6 ? [5.9, 6.1, 5.8, 5.2, 5.6, 5.4][i] : null;
  const forecast = i >= 5 ? [5.4, 5.1, 5.3, 5.6, 5.8, 5.7, 5.5][i - 5] : null;
  const budget = [6.2, 6.3, 6.2, 6.4, 6.8, 6.9, 6.6, 6.4, 6.5, 6.7, 6.9, 7.0][i];
  return { month, actual, forecast, budget };
});
