/**
 * COMPOSIÇÃO DOS DASHBOARDS — por investida e do portfólio.
 *
 * O problema que este arquivo resolve: até a Fase 5.2, o Dashboard Executivo
 * lia `mocks/financeiro.ts` sem receber o slug da empresa. As seis investidas
 * mostravam os MESMOS números — caixa, orçamento, forecast e contas bancárias
 * idênticos — mudando apenas o nome no cabeçalho.
 *
 * A decisão de produto (Fase 6): o dashboard é ADAPTATIVO. Cada investida
 * exibe os blocos que a SUA aba de KPI sustenta, e só eles. A Morro Verde tem
 * trajetória operacional; a Ativa, ficha de projeto e premissas de retorno; a
 * NZR, curva de recursos por cut-off; a IOCG, a escada do earn-in; a Alvo, a
 * diluição da participação; a Neeo, as rotas de saída. Nenhum bloco é
 * preenchido para manter simetria visual — bloco sem fonte simplesmente não
 * existe naquela tela.
 *
 * Este arquivo COMPÕE; não inventa. Todo valor vem de `kpis.ts` ou
 * `portfolio.ts`, que por sua vez transcrevem o workbook.
 */
import type { DataStatus, SourceRef } from "@modules/data-source";
import { SOURCES } from "./provenance";
import {
  ALVO_TRAJETORIA, COCKPIT, COCKPIT_TOTAIS, COMPOSICAO, DRY_POWDER, EVOLUCAO_FUNDO,
  FUNDO, IOCG_EARN_IN, KPIS, MORRO_VERDE_TRAJETORIA, NZR_CUTOFF, ONDE_ESTAMOS,
  USO_DO_CAPITAL, type KpiInvestida,
} from "./kpis";
import { POSICOES, type InvestidaSlug } from "./portfolio";

/* ═════════════════════════ CONTRATO DOS BLOCOS ═════════════════════════
 * Seis formas cobrem tudo o que as abas trazem. Um bloco novo só entra se
 * a fonte trouxer uma forma que estas não expressam — não o contrário. */

export interface BlocoBase {
  id: string;
  titulo: string;
  /** Leitura de apoio sob o título. */
  descricao?: string;
  fonte: SourceRef;
  dataStatus: DataStatus;
  /** Ressalva exibida junto ao bloco (conflito documental, data-base própria). */
  ressalva?: string;
}

/** Faixa de indicadores de topo. */
export interface BlocoMetricas extends BlocoBase {
  tipo: "metricas";
  itens: { rotulo: string; valor: string; nota?: string; ausente?: boolean }[];
}

/** Ficha de duas colunas — rótulo e valor, como a fonte escreve. */
export interface BlocoFicha extends BlocoBase {
  tipo: "ficha";
  linhas: { rotulo: string; valor: string }[];
}

/** Tabela genérica. `null` numa célula = a fonte não traz o valor. */
export interface BlocoTabela extends BlocoBase {
  tipo: "tabela";
  colunas: { rotulo: string; alinhamento?: "left" | "right" | "center" }[];
  linhas: (string | null)[][];
  /** Índice das linhas que devem receber destaque (totais). */
  destaque?: number[];
}

/** Série para gráfico de barras comparativas ou de linha. */
export interface BlocoSerie extends BlocoBase {
  tipo: "serie";
  forma: "barras" | "linha";
  /** Rótulo do eixo de categorias. */
  unidade: string;
  pontos: { rotulo: string; a: number; b?: number }[];
  legendaA: string;
  legendaB?: string;
}

/** Lista de marcos/decisões, clicável quando há detalhe. */
export interface BlocoMarcos extends BlocoBase {
  tipo: "marcos";
  itens: { titulo: string; categoria?: string; responsavel?: string; alvo?: string; status?: string; notas?: string }[];
}

/** Notas narrativas — destaques, rotas de saída, leitura de situação. */
export interface BlocoNotas extends BlocoBase {
  tipo: "notas";
  itens: { rotulo: string; texto: string }[];
}

export type BlocoDashboard =
  | BlocoMetricas | BlocoFicha | BlocoTabela | BlocoSerie | BlocoMarcos | BlocoNotas;

/* ═══════════════════════════ FORMATAÇÃO ═══════════════════════════
 * Os valores viajam formatados a partir daqui porque a UNIDADE é parte do
 * dado: "USD '000", "BRL mm" e "kt" não podem ser trocadas por um símbolo
 * genérico na tela. Formatar aqui mantém a unidade colada ao número. */

const nf = (casas: number) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });

/** USD '000 → "US$ 11,3 mi" (o workbook registra em milhares). */
function usdMil(v: number): string {
  const sinal = v < 0 ? "\u2212" : "";
  const abs = Math.abs(v);
  /* Abaixo de um milhão a fonte fica mais legível em milhares: "US$ 801 mil"
     em vez de "US$ 0,80 mi". Acima, uma casa decimal — "US$ -5,41 mi" quebrava
     em duas linhas na faixa de indicadores e virava o elemento mais chamativo
     da tela. */
  if (abs === 0) return "US$ 0";
  if (abs < 1000) return `${sinal}US$ ${nf(0).format(abs)} mil`;
  return `${sinal}US$ ${nf(1).format(abs / 1000)} mi`;
}
function pct(v: number, casas = 1): string {
  return `${nf(casas).format(v * 100)}%`;
}
function num(v: number, casas = 1): string {
  return nf(casas).format(v);
}
function multiplo(v: number): string {
  return `${nf(2).format(v)}x`;
}
/** Célula ausente na fonte — nunca "0", nunca vazio silencioso. */
const SEM_VALOR = "—";

/* ══════════════════ DASHBOARD DE INVESTIDA (adaptativo) ══════════════════ */

/** Snapshot — o único bloco que as seis abas têm em comum. */
function blocoSnapshot(kpi: KpiInvestida): BlocoMetricas {
  const s = kpi.snapshot;
  return {
    tipo: "metricas",
    id: "snapshot",
    titulo: "Posição do investimento",
    descricao: `${s.fase} · data-base 31/12/2025`,
    fonte: kpi.source,
    dataStatus: "REAL",
    itens: [
      { rotulo: "Capital investido", valor: usdMil(s.costBasisUSD) },
      { rotulo: "Valor justo", valor: usdMil(s.fairValueUSD) },
      { rotulo: "Não realizado", valor: usdMil(s.unrealizedUSD) },
      { rotulo: "Múltiplo sobre o capital", valor: multiplo(s.tvpi) },
      s.ownership === null
        ? { rotulo: "Participação", valor: "Não disponibilizado", ausente: true }
        : { rotulo: "Participação", valor: pct(s.ownership, 2) },
    ],
    ressalva:
      s.ownership === null
        ? "A participação da Ore nesta investida está em conflito documental em aberto — os documentos divergem e nenhum valor foi eleito."
        : undefined,
  };
}

function blocoFicha(kpi: KpiInvestida): BlocoFicha | null {
  if (!kpi.ficha?.length) return null;
  return {
    tipo: "ficha", id: "ficha", titulo: "Visão geral do ativo",
    fonte: kpi.source, dataStatus: "REAL",
    linhas: kpi.ficha,
  };
}

function blocoMarcos(kpi: KpiInvestida): BlocoMarcos | null {
  if (!kpi.marcos?.length) return null;
  return {
    tipo: "marcos", id: "marcos", titulo: "Marcos e decisões",
    descricao: `${kpi.marcos.length} registrados na fonte`,
    fonte: kpi.source, dataStatus: "REAL",
    itens: kpi.marcos,
  };
}

function blocoNotas(kpi: KpiInvestida, titulo: string): BlocoNotas | null {
  if (!kpi.destaques?.length) return null;
  return {
    tipo: "notas", id: "notas", titulo,
    fonte: kpi.source, dataStatus: "REAL",
    itens: kpi.destaques,
  };
}

/* ── Blocos exclusivos de cada investida ────────────────────────────────── */

function blocosMorroVerde(kpi: KpiInvestida): BlocoDashboard[] {
  const linhas = MORRO_VERDE_TRAJETORIA.map((l) => {
    const fmt = (v: number | null) =>
      v === null ? null : l.unidade === "%" ? pct(v) : num(v, 1);
    return [l.metrica, l.unidade, fmt(l.real2025), fmt(l.budget2025), fmt(l.real2024), fmt(l.real2023), fmt(l.real2022)];
  });

  const receita = MORRO_VERDE_TRAJETORIA.find((l) => l.metrica === "Receita líquida")!;
  const ebitda = MORRO_VERDE_TRAJETORIA.find((l) => l.metrica === "EBITDA gerencial")!;
  const producaoFosfato = MORRO_VERDE_TRAJETORIA.find((l) => l.metrica === "Produção fosfato")!;
  const producaoCalcario = MORRO_VERDE_TRAJETORIA.find((l) => l.metrica === "Produção calcário")!;

  return [
    {
      tipo: "serie", id: "mv-resultado", forma: "barras",
      titulo: "Receita líquida × EBITDA gerencial",
      descricao: "BRL milhões · realizado por ano",
      unidade: "BRL mm",
      legendaA: "Receita líquida", legendaB: "EBITDA gerencial",
      fonte: kpi.source, dataStatus: "REAL",
      pontos: [
        { rotulo: "2022", a: receita.real2022 ?? 0, b: ebitda.real2022 ?? 0 },
        { rotulo: "2023", a: receita.real2023 ?? 0, b: ebitda.real2023 ?? 0 },
        { rotulo: "2024", a: receita.real2024 ?? 0, b: ebitda.real2024 ?? 0 },
        { rotulo: "2025", a: receita.real2025 ?? 0, b: ebitda.real2025 ?? 0 },
      ],
      ressalva:
        "O EBITDA de 2023 aparece como BRL 6,6 mm na ótica gerencial e BRL −35,8 mm na contábil. São métricas distintas e ambas constam da fonte — o gráfico mostra a gerencial.",
    },
    {
      tipo: "serie", id: "mv-producao", forma: "barras",
      titulo: "Produção — orçado × realizado 2025",
      descricao: "kt por produto",
      unidade: "kt",
      legendaA: "Realizado 2025", legendaB: "Orçado 2025",
      fonte: kpi.source, dataStatus: "REAL",
      pontos: [
        { rotulo: "Fosfato", a: producaoFosfato.real2025 ?? 0, b: producaoFosfato.budget2025 ?? 0 },
        { rotulo: "Calcário", a: producaoCalcario.real2025 ?? 0, b: producaoCalcario.budget2025 ?? 0 },
      ],
    },
    {
      tipo: "tabela", id: "mv-trajetoria",
      titulo: "Trajetória operacional",
      descricao: "Como a fonte registra: 2025 realizado e orçado, mais os realizados de 2024, 2023 e 2022",
      fonte: kpi.source, dataStatus: "REAL",
      colunas: [
        { rotulo: "Métrica" }, { rotulo: "Unidade" },
        { rotulo: "2025 real", alinhamento: "right" }, { rotulo: "2025 orçado", alinhamento: "right" },
        { rotulo: "2024", alinhamento: "right" }, { rotulo: "2023", alinhamento: "right" },
        { rotulo: "2022", alinhamento: "right" },
      ],
      linhas,
    },
  ];
}

function blocosNzr(kpi: KpiInvestida): BlocoDashboard[] {
  return [
    {
      tipo: "serie", id: "nzr-cutoff", forma: "linha",
      titulo: "Recursos por cut-off grade",
      descricao: "Quanto ouro resta conforme o teor mínimo sobe — NI 43-101",
      unidade: "koz de ouro",
      legendaA: "Ouro contido (koz)",
      fonte: kpi.source, dataStatus: "REAL",
      pontos: NZR_CUTOFF.map((p) => ({ rotulo: `${num(p.cutOffGt, 2)} g/t`, a: Math.round(p.auOncas / 1000) })),
    },
    {
      tipo: "tabela", id: "nzr-tabela-cutoff",
      titulo: "Sensibilidade ao cut-off",
      fonte: kpi.source, dataStatus: "REAL",
      colunas: [
        { rotulo: "Cut-off (g/t)", alinhamento: "right" },
        { rotulo: "Toneladas (mil)", alinhamento: "right" },
        { rotulo: "Teor (g/t Au)", alinhamento: "right" },
        { rotulo: "Ouro contido (oz)", alinhamento: "right" },
      ],
      linhas: NZR_CUTOFF.map((p) => [
        num(p.cutOffGt, 2), nf(0).format(p.toneladasMil), num(p.auGt, 2), nf(0).format(p.auOncas),
      ]),
    },
  ];
}

function blocosIocg(kpi: KpiInvestida): BlocoDashboard[] {
  return [
    {
      tipo: "tabela", id: "iocg-earn-in",
      titulo: "Escada do earn-in — Centaurus Metals",
      descricao: "Valores em AUD milhares, moeda da contraparte. Não convertidos.",
      fonte: kpi.source, dataStatus: "REAL",
      colunas: [
        { rotulo: "Estágio" },
        { rotulo: "Atribuível à Ore", alinhamento: "right" },
        { rotulo: "Acumulado", alinhamento: "right" },
        { rotulo: "Commitment" },
        { rotulo: "Go / no-go" },
      ],
      linhas: IOCG_EARN_IN.map((e) => [
        e.estagio,
        e.atribuivelAUD === null ? SEM_VALOR : `AUD ${num(e.atribuivelAUD, 2)} k`,
        e.acumuladoAUD === null ? SEM_VALOR : `AUD ${nf(0).format(e.acumuladoAUD)} k`,
        e.commitment,
        e.comentario,
      ]),
    },
  ];
}

function blocosAlvo(kpi: KpiInvestida): BlocoDashboard[] {
  return [
    {
      tipo: "serie", id: "alvo-diluicao", forma: "linha",
      titulo: "Diluição da participação × valor justo",
      descricao: "A participação caiu de 19,9% para 9,56% em quatro trimestres — a Ore não acompanhou os cap raises",
      unidade: "%",
      legendaA: "Participação (%)",
      fonte: kpi.source, dataStatus: "REAL",
      pontos: ALVO_TRAJETORIA.map((p) => ({ rotulo: p.trimestre, a: Number((p.ownership * 100).toFixed(2)) })),
      ressalva:
        "Série como esta aba reporta. O conflito documental sobre participação e valor justo da Alvo segue em aberto — outros documentos divergem e nenhum valor foi eleito.",
    },
    {
      tipo: "tabela", id: "alvo-trajetoria",
      titulo: "Posição trimestre a trimestre",
      fonte: kpi.source, dataStatus: "REAL",
      colunas: [
        { rotulo: "Trimestre" },
        { rotulo: "Participação", alinhamento: "right" },
        { rotulo: "Valor justo", alinhamento: "right" },
      ],
      linhas: [...ALVO_TRAJETORIA].reverse().map((p) => [p.trimestre, pct(p.ownership, 2), usdMil(p.fairValueUSD)]),
    },
  ];
}

/** Série trimestral de fair value — as seis têm, vinda da Base de Dados. */
function blocoSerieFV(slug: InvestidaSlug): BlocoSerie | null {
  const pos = POSICOES[slug];
  if (pos.serieFV.length < 2) return null;
  return {
    tipo: "serie", id: "serie-fv", forma: "linha",
    titulo: "Evolução do valor justo",
    descricao: "Marcação trimestral, USD milhares, como a Base de Dados registra",
    unidade: "US$ mil",
    legendaA: "Valor justo",
    fonte: { ...SOURCES.serieFV, cell: pos.source.cell },
    dataStatus: pos.serieStatus ?? pos.fairValueStatus,
    pontos: pos.serieFV.map((p) => ({ rotulo: p.trimestre, a: p.valorUSD })),
    ressalva: pos.serieNota,
  };
}

/**
 * Composição do dashboard de uma investida.
 *
 * A ordem é a mesma nas seis — posição, evolução, o que é próprio dela,
 * ficha, marcos, notas — para que trocar de investida não exija reaprender a
 * tela. O que muda é QUAIS blocos existem.
 */
export function dashboardDaInvestida(slug: string): BlocoDashboard[] | undefined {
  const kpi = KPIS[slug as InvestidaSlug];
  if (!kpi) return undefined;

  const especificos: Record<InvestidaSlug, (k: KpiInvestida) => BlocoDashboard[]> = {
    "morro-verde": blocosMorroVerde,
    "nazareno-gold": blocosNzr,
    "rio-novo": blocosIocg,
    "alvo-minerals": blocosAlvo,
    "ativa-mineracao": () => [],
    "neeo-exploration": () => [],
  };

  const serieFV = blocoSerieFV(kpi.slug);
  const tituloNotas =
    kpi.slug === "morro-verde" ? "Destaques de 2025 e eventos subsequentes"
      : kpi.slug === "ativa-mineracao" ? "Premissas de retorno e preços"
        : kpi.slug === "neeo-exploration" ? "Rotas de saída (não excludentes)"
          : kpi.slug === "rio-novo" ? "Monitoramento contratual"
            : "Destaques";

  return [
    blocoSnapshot(kpi),
    ...(serieFV ? [serieFV] : []),
    ...especificos[kpi.slug](kpi),
    blocoFicha(kpi),
    blocoMarcos(kpi),
    blocoNotas(kpi, tituloNotas),
  ].filter((b): b is BlocoDashboard => b !== null);
}

/* ═══════════════════ DASHBOARD GERAL DA ORE (portfólio) ═══════════════════
 * Espelha o cockpit da aba 3 mais a posição do fundo das abas 1 e 4. É a
 * visão que a própria Ore mantém — não uma leitura inventada por cima dela. */

const STATUS_ORDEM = ["Fora do trilho", "Atenção", "No trilho"] as const;

export function dashboardDoPortfolio(): BlocoDashboard[] {
  const foraDoTrilho = COCKPIT.filter((c) => c.status === "Fora do trilho").length;

  const posicaoFundo: BlocoMetricas = {
    tipo: "metricas", id: "fundo",
    titulo: "Posição do fundo",
    descricao: "Ore Mining PE I FIP · consolidado com o co-investimento Ore Fosfato MV FIP · data-base 31/12/2025",
    fonte: FUNDO.source, dataStatus: "REAL",
    itens: [
      { rotulo: "Commitments", valor: usdMil(FUNDO.commitmentsUSD) },
      { rotulo: "Capital chamado", valor: usdMil(FUNDO.paidInUSD), nota: `${pct(FUNDO.percentCalled, 2)} do comprometido` },
      { rotulo: "Valor não realizado", valor: usdMil(FUNDO.unrealizedValueUSD) },
      { rotulo: "Saldo de caixa do fundo", valor: usdMil(FUNDO.cashBalanceUSD) },
      /* Cinco indicadores, não seis: com a sidebar de 320px, a sexta coluna
         quebrava "US$ 55,3 mi" em duas linhas e o número virava ruído. O DPI
         é zero e cabe como leitura de apoio do TVPI. */
      { rotulo: "TVPI líquido", valor: multiplo(FUNDO.tvpiNet), nota: `sobre o capital chamado · DPI ${multiplo(FUNDO.dpi)}` },
    ],
    ressalva:
      "O saldo de caixa acima é do FUNDO, não das investidas. Nenhuma investida tem caixa próprio disponibilizado nos documentos, exceto a Morro Verde (31/03/2026).",
  };

  const cockpit: BlocoTabela = {
    tipo: "tabela", id: "cockpit",
    titulo: "Cockpit por ativo",
    descricao: `${COCKPIT.length} investidas · ${foraDoTrilho} fora do trilho · status e tese preenchidos pela Ore na fonte`,
    fonte: SOURCES.dashboard, dataStatus: "REAL",
    colunas: [
      { rotulo: "Empresa" }, { rotulo: "Status" }, { rotulo: "Tese" },
      { rotulo: "Capital investido", alinhamento: "right" },
      { rotulo: "Valor justo", alinhamento: "right" },
      { rotulo: "Var. no trimestre", alinhamento: "right" },
      { rotulo: "Dry powder", alinhamento: "right" },
      { rotulo: "Próximo marco crítico" },
    ],
    linhas: [
      ...[...COCKPIT]
        .sort((a, b) => STATUS_ORDEM.indexOf(a.status) - STATUS_ORDEM.indexOf(b.status))
        .map((c) => [
          c.nome, c.status, c.tese,
          usdMil(c.costBasisUSD), usdMil(c.fairValueUSD),
          usdMil(c.varFvQoQUSD),
          c.dryPowderUSD === 0 ? SEM_VALOR : usdMil(c.dryPowderUSD),
          c.proximoMarco,
        ]),
      [
        "Total", "", "",
        usdMil(COCKPIT_TOTAIS.costBasisUSD), usdMil(COCKPIT_TOTAIS.fairValueUSD),
        usdMil(COCKPIT_TOTAIS.varFvQoQUSD), usdMil(COCKPIT_TOTAIS.dryPowderUSD), "",
      ],
    ],
    destaque: [COCKPIT.length],
    ressalva:
      "A variação total do trimestre é a que a fonte registra (−US$ 2,6 mi) e não corresponde à soma das seis linhas. A divergência é da planilha e foi preservada — recalcular aqui seria corrigir a fonte por conta própria.",
  };

  const notas: BlocoNotas = {
    tipo: "notas", id: "onde-estamos",
    titulo: "Onde estamos",
    descricao: "Leitura de situação escrita pela Ore na capa do workbook",
    fonte: FUNDO.source, dataStatus: "REAL",
    itens: ONDE_ESTAMOS.map((t, i) => ({ rotulo: i === 0 ? "Estágio do fundo" : "", texto: t })),
  };

  const composicao: BlocoSerie = {
    tipo: "serie", id: "composicao", forma: "barras",
    titulo: "Composição do portfólio",
    descricao: "Participação de cada ativo no valor não realizado",
    unidade: "%",
    legendaA: "Do valor não realizado",
    fonte: FUNDO.source, dataStatus: "REAL",
    pontos: COMPOSICAO.map((c) => ({ rotulo: c.nome, a: Number((c.fracao * 100).toFixed(2)) })),
  };

  const capital: BlocoTabela = {
    tipo: "tabela", id: "uso-capital",
    titulo: "Uso do capital chamado",
    descricao: "Cumulativo até Q4 2025",
    fonte: DRY_POWDER.source, dataStatus: "REAL",
    colunas: [
      { rotulo: "Rubrica" },
      { rotulo: "Valor", alinhamento: "right" },
      { rotulo: "% do capital chamado", alinhamento: "right" },
    ],
    linhas: USO_DO_CAPITAL.map((u) => [u.rubrica, usdMil(u.valorUSD), pct(u.fracaoPaidIn, 1)]),
  };

  const dryPowder: BlocoMetricas = {
    tipo: "metricas", id: "dry-powder",
    titulo: "Dry powder",
    descricao: DRY_POWDER.nota,
    fonte: DRY_POWDER.source, dataStatus: "REAL",
    itens: [
      { rotulo: "Investable estimado", valor: usdMil(DRY_POWDER.investableUSD) },
      { rotulo: "Já investido", valor: usdMil(DRY_POWDER.investidoUSD) },
      { rotulo: "Compromisso pendente (NZR fase 3.2)", valor: usdMil(DRY_POWDER.compromissoPendenteNzrUSD) },
      { rotulo: "Dry powder estimado", valor: usdMil(DRY_POWDER.dryPowderUSD) },
    ],
  };

  const evolucao: BlocoTabela = {
    tipo: "tabela", id: "evolucao-fundo",
    titulo: "Evolução anual do fundo",
    descricao: "Cada ano preserva o seu câmbio de referência — nenhum valor foi reexpresso",
    fonte: DRY_POWDER.source, dataStatus: "REAL",
    colunas: [
      { rotulo: "Ano" },
      { rotulo: "Commitments", alinhamento: "right" },
      { rotulo: "Capital chamado", alinhamento: "right" },
      { rotulo: "% chamado", alinhamento: "right" },
      { rotulo: "Caixa do fundo", alinhamento: "right" },
      { rotulo: "Investimentos", alinhamento: "center" },
      { rotulo: "Câmbio BRL/USD", alinhamento: "right" },
    ],
    linhas: [...EVOLUCAO_FUNDO].reverse().map((a) => [
      a.ano, usdMil(a.commitmentsUSD), usdMil(a.paidInUSD), pct(a.percentCalled, 1),
      usdMil(a.cashBalanceUSD), String(a.investimentos), num(a.fxBrlPorUsd, 4),
    ]),
  };

  return [posicaoFundo, cockpit, composicao, notas, dryPowder, capital, evolucao];
}

/* ═══════════════ BLOCOS FINANCEIROS POR INVESTIDA (Fase 6) ═══════════════
 * Até aqui as telas de Financeiro liam um conjunto único e exibiam os MESMOS
 * números nas seis investidas. Só uma tem resultado documentado: a Morro
 * Verde. Estes blocos entram no topo da tela dela; as demais continuam
 * declarando o estado do dado que já declaravam. */

export function blocosFinanceirosDaInvestida(slug: string): BlocoDashboard[] {
  if (slug !== "morro-verde") return [];
  const kpi = KPIS["morro-verde"];

  const receita = MORRO_VERDE_TRAJETORIA.find((l) => l.metrica === "Receita líquida")!;
  const ebitdaGer = MORRO_VERDE_TRAJETORIA.find((l) => l.metrica === "EBITDA gerencial")!;
  const ebitdaCon = MORRO_VERDE_TRAJETORIA.find((l) => l.metrica === "EBITDA contábil")!;
  const margem = MORRO_VERDE_TRAJETORIA.find((l) => l.metrica === "Margem EBITDA gerencial")!;

  const brl = (v: number | null) => (v === null ? null : `BRL ${num(v, 1)} mm`);

  return [
    {
      tipo: "metricas", id: "mv-resultado-2025",
      titulo: "Resultado documentado · 2025",
      descricao: "Realizado do exercício, como o workbook de gestão registra",
      fonte: kpi.source, dataStatus: "REAL",
      itens: [
        { rotulo: "Receita líquida", valor: brl(receita.real2025) ?? "—", nota: `orçado ${brl(receita.budget2025)}` },
        { rotulo: "EBITDA gerencial", valor: brl(ebitdaGer.real2025) ?? "—", nota: `orçado ${brl(ebitdaGer.budget2025)}` },
        { rotulo: "EBITDA contábil", valor: brl(ebitdaCon.real2025) ?? "—" },
        { rotulo: "Margem EBITDA gerencial", valor: margem.real2025 === null ? "—" : pct(margem.real2025) },
      ],
      ressalva:
        "EBITDA gerencial e contábil são métricas distintas e ambas constam da fonte. A diferença de 2025 (BRL 30,5 mm × BRL 27,9 mm) não é erro de transcrição.",
    },
    {
      tipo: "tabela", id: "mv-resultado-serie",
      titulo: "Resultado por exercício",
      descricao: "BRL milhões · 2025 realizado e orçado, mais os realizados anteriores",
      fonte: kpi.source, dataStatus: "REAL",
      colunas: [
        { rotulo: "Métrica" },
        { rotulo: "2025 real", alinhamento: "right" }, { rotulo: "2025 orçado", alinhamento: "right" },
        { rotulo: "2024", alinhamento: "right" }, { rotulo: "2023", alinhamento: "right" },
        { rotulo: "2022", alinhamento: "right" },
      ],
      linhas: [receita, ebitdaGer, ebitdaCon].map((l) => [
        l.metrica, brl(l.real2025), brl(l.budget2025), brl(l.real2024), brl(l.real2023), brl(l.real2022),
      ]),
    },
  ];
}
