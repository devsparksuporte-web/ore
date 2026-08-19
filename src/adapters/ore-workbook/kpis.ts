/**
 * KPI POR INVESTIDA + COCKPIT DO PORTFÓLIO + POSIÇÃO DO FUNDO.
 *
 * Transcrição literal das abas 1 (Capa), 3 (Dashboard), 4 (Capital e Caixa) e
 * 7 a 12 (KPI por empresa) do workbook de gestão da Ore.
 *
 * Por que este arquivo existe: até aqui o Dashboard Executivo mostrava os
 * MESMOS números em todas as investidas — os serviços financeiros não recebiam
 * o slug da empresa. As abas de KPI provam que a fonte tem dados próprios de
 * cada uma, e de NATUREZAS diferentes: a Morro Verde tem trajetória
 * operacional; a Ativa, reservas e premissas de retorno; a NZR, curva de
 * recursos por cut-off; a IOCG, a escada do earn-in; a Alvo, diluição de
 * participação; a Neeo, rotas de saída.
 *
 * ⚠️ REGRAS QUE VALEM PARA CADA LINHA ABAIXO
 *  · Nenhum número é estimado, arredondado por conveniência ou inferido.
 *  · Nenhuma moeda é convertida: USD '000, BRL mm, AUD k e kt convivem como a
 *    fonte registra. A unidade viaja junto com o valor.
 *  · Percentuais vêm como fração (0.4236 = 42,36%), como na planilha.
 *  · Onde a fonte não traz o dado, o campo não existe — nunca vira zero.
 */
import type { DataStatus, Fornecido, SourceRef } from "@modules/data-source";
import { SOURCES } from "./provenance";
import {
  MORRO_VERDE_OPERACIONAL, MORRO_VERDE_ORCADO_2025,
  type AnoOperacionalMV, type InvestidaSlug,
} from "./portfolio";

/* ═══════════════════════════ CONTRATOS ═══════════════════════════ */

/** Bloco SNAPSHOT — presente nas seis abas de KPI, com a mesma forma. */
export interface SnapshotKPI {
  /** USD '000 */
  costBasisUSD: number;
  /** USD '000 — data-base Q4 2025 */
  fairValueUSD: number;
  /** USD '000 — ganho/perda não realizado */
  unrealizedUSD: number;
  /** Total Value to Paid-In sobre o custo, como a aba calcula. */
  tvpi: number;
  /** Fração (0–1). `null` quando os documentos conflitam. */
  ownership: Fornecido<number>;
  fase: string;
  status: string;
}

/** Linha de "visão geral" — rótulo e valor, exatamente como a fonte escreve. */
export interface LinhaFicha {
  rotulo: string;
  valor: string;
}

/** Marco/decisão como as abas de KPI registram. */
export interface MarcoKPI {
  titulo: string;
  categoria?: string;
  responsavel?: string;
  alvo?: string;
  status?: string;
  notas?: string;
}

/** Destaque narrativo (a Morro Verde tem uma seção inteira destes). */
export interface DestaqueKPI {
  rotulo: string;
  texto: string;
}

export interface KpiInvestida {
  slug: InvestidaSlug;
  /** Razão social como a aba de KPI nomeia. */
  nomeFonte: string;
  snapshot: SnapshotKPI;
  /** Aba de origem deste conjunto. */
  source: SourceRef;
  ficha?: LinhaFicha[];
  marcos?: MarcoKPI[];
  destaques?: DestaqueKPI[];
}

/* ═════════════════ SNAPSHOT + FICHA + MARCOS POR INVESTIDA ═════════════════
 * Aba 7 a 12. Cada `source` aponta para a aba da própria investida. */

/* ── Morro Verde · aba "7. KPI Morro Verde" ─────────────────────────────── */

/**
 * Trajetória operacional — a única investida com série de resultado e produção.
 * Receita e EBITDA em BRL milhões; produção e vendas em kt. A fonte traz 2025
 * Real, 2025 Budget e os realizados de 2024, 2023 e 2022.
 *
 * `null` = a fonte não registra o valor naquele ano (não é zero). Produção e
 * vendas em 2023 e 2022 constam como 0 na planilha e são transcritas como 0:
 * a mina não produzia — zero é o valor, não a ausência dele.
 */
export interface LinhaOperacional {
  metrica: string;
  unidade: string;
  real2025: Fornecido<number>;
  budget2025: Fornecido<number>;
  real2024: Fornecido<number>;
  real2023: Fornecido<number>;
  real2022: Fornecido<number>;
}

/**
 * Trajetória operacional em forma de TABELA (uma linha por métrica).
 *
 * ⚠️ NÃO é uma segunda transcrição. Deriva de `MORRO_VERDE_OPERACIONAL` e
 * `MORRO_VERDE_ORCADO_2025`, que já transcrevem esta mesma aba em forma de
 * série anual. Duas transcrições dos mesmos números divergiriam com o tempo —
 * e uma plataforma de governança com dois valores para o mesmo dado perde a
 * única coisa que a sustenta. Aqui só se muda a FORMA de ler.
 */
export const MORRO_VERDE_TRAJETORIA: LinhaOperacional[] = (() => {
  const porAno = (ano: string) => MORRO_VERDE_OPERACIONAL.find((a) => a.ano === ano);
  const a25 = porAno("2025"), a24 = porAno("2024"), a23 = porAno("2023"), a22 = porAno("2022");
  const o = MORRO_VERDE_ORCADO_2025;

  const linha = (
    metrica: string,
    unidade: string,
    campo: (a: AnoOperacionalMV | undefined) => Fornecido<number> | undefined,
    orcado: Fornecido<number>,
  ): LinhaOperacional => ({
    metrica, unidade,
    real2025: campo(a25) ?? null,
    budget2025: orcado,
    real2024: campo(a24) ?? null,
    real2023: campo(a23) ?? null,
    real2022: campo(a22) ?? null,
  });

  return [
    linha("Receita líquida", "BRL mm", (a) => a?.receitaLiquidaBRLmm, o.receitaLiquidaBRLmm),
    linha("EBITDA gerencial", "BRL mm", (a) => a?.ebitdaGerencialBRLmm, o.ebitdaGerencialBRLmm),
    linha("EBITDA contábil", "BRL mm", (a) => a?.ebitdaContabilBRLmm, o.ebitdaContabilBRLmm),
    linha("Margem EBITDA gerencial", "%", (a) => a?.margemEbitdaGerencial, o.margemEbitdaGerencial),
    linha("Produção fosfato", "kt", (a) => a?.producaoFosfatoKt, o.producaoFosfatoKt),
    linha("Produção calcário", "kt", (a) => a?.producaoCalcarioKt, o.producaoCalcarioKt),
    /* A fonte não orça vendas — só produção. `null`, nunca repetindo o orçado
       de produção como se fosse meta de venda. */
    linha("Vendas fosfato", "kt", (a) => a?.vendasFosfatoKt, null),
    linha("Vendas calcário", "kt", (a) => a?.vendasCalcarioKt, null),
  ];
})();

const MORRO_VERDE: KpiInvestida = {
  slug: "morro-verde",
  nomeFonte: "MV Fosfato S.A.",
  source: SOURCES.kpiMorroVerde,
  snapshot: {
    costBasisUSD: 20253, fairValueUSD: 14847, unrealizedUSD: -5406,
    tvpi: 0.7330765812472226, ownership: 0.4236,
    fase: "Mine Production",
    status: "Mine Production / Turnaround + Integração Massari",
  },
  destaques: [
    { rotulo: "1H25 — desempenho fraco", texto: "Produtividade baixa, REM elevada, atrasos CEMIG/P300. EBITDA próximo a zero no 1T25, negativo na ótica contábil no 2T25." },
    { rotulo: "2H25 — recuperação operacional", texto: "Fosfato acima do orçado em 3T25/4T25. Mobile plant contratada para cumprir vendas (custo adicional BRL 9mm FY)." },
    { rotulo: "Mix e preços", texto: "Preço médio do fosfato cerca de 10% abaixo do orçado, por mix com grade inferior." },
    { rotulo: "Calcário", texto: "Volumes abaixo do plano por atrasos em P300/CEMIG. Planta nova 97% concluída, ramp-up 2026 — potencial de cerca de 1 Mtpa em 2027." },
    { rotulo: "Dívida", texto: "Alavancagem elevada renegociada. Itaú obteve waiver e período de carência no 2T25." },
    { rotulo: "Evento subsequente (jan/26)", texto: "Transação com Massari: NewCo verticalmente integrada. Pró-forma net leverage abaixo de 3,0x (de cerca de 6,0x MV standalone)." },
    { rotulo: "Governança pós-deal", texto: "Massari indica Chairman e 2 membros do Board. Ore indica CFO e 2 membros. Super-maioria de 87,5% em M&A, dívida, CAPEX, dividendos e IPO." },
    { rotulo: "Valuation", texto: "Reduzido para BRL 193M em dez/25 (−37% vs dez/24). Fatores: taxa de desconto, resultados 2025, preço/mix e capital de giro." },
  ],
  marcos: [
    { titulo: "Integração Massari — plano 100 dias", responsavel: "CEO NewCo", alvo: "2T 2026", status: "Em andamento", notas: "Post-deal jan/26" },
    { titulo: "Ramp-up de produção de calcário — planta nova", responsavel: "COO", alvo: "1S 2026", status: "Em andamento", notas: "Planta 97% concluída" },
    { titulo: "Rolagem de dívida — reperfilamento", responsavel: "CFO NewCo", alvo: "2T 2026", status: "Em andamento" },
    { titulo: "Break-even operacional sustentado", responsavel: "CEO NewCo", alvo: "Ao longo de 2026", status: "Em andamento" },
    { titulo: "Aprovação do plano de negócios e orçamento 2026", responsavel: "Conselho MV", alvo: "1T 2026", status: "Aberto" },
    { titulo: "Definição de 3 a 5 KPIs do Conselho e gatilhos", responsavel: "CFO + Ore", alvo: "1T 2026", status: "Aberto" },
    { titulo: "Reporting institucional auditável em curso", responsavel: "CFO", alvo: "2S 2026", status: "Aberto" },
    { titulo: "Exit readiness — controles e narrativa", responsavel: "Ore", alvo: "2S 2026", status: "Aberto" },
  ],
};

/* ── Ativa Mineração · aba "8. KPI Ativa" ───────────────────────────────── */

const ATIVA: KpiInvestida = {
  slug: "ativa-mineracao",
  nomeFonte: "Ativa Mineração SPE S/A",
  source: SOURCES.kpiAtiva,
  snapshot: {
    costBasisUSD: 9000, fairValueUSD: 11286, unrealizedUSD: 2286,
    tvpi: 1.254, ownership: 0.6,
    fase: "Licensing and Engineering",
    status: "Licensing and Engineering — Serrote da Pedra Preta (Ti, FeV)",
  },
  ficha: [
    { rotulo: "Local", valor: "Pernambuco: Floresta e Carnaubeira da Penha" },
    { rotulo: "Reservas — stockpiles", valor: "542 kt @ 18,7% TiO₂ / 0,37% V₂O₅" },
    { rotulo: "Reservas — in situ", valor: "5 Mt @ 11,8% TiO₂ / 0,24% V₂O₅" },
    { rotulo: "Capacidade fase 1 (Floresta)", valor: "180 kt/ano" },
    { rotulo: "Capacidade fase 2 (expansão)", valor: "600 kt/ano" },
    { rotulo: "Vida útil a plena capacidade", valor: "~10 anos" },
    { rotulo: "Receita projetada (full scale)", valor: "USD 40M/ano" },
    { rotulo: "Margem EBITDA projetada", valor: "~30%" },
    { rotulo: "CAPEX planta 180 kt/ano", valor: "BRL 25M" },
  ],
  marcos: [
    { titulo: "Vistoria CPRH no site", categoria: "Licenciamento", responsavel: "CPRH", alvo: "28–29 jan 2026", status: "Agendado" },
    { titulo: "Audiência pública", categoria: "Licenciamento", responsavel: "CPRH + Ativa", alvo: "Fev 2026", status: "Em andamento", notas: "Preparativos em curso" },
    { titulo: "SBLC (carta fiança) bancária", categoria: "Financiamento", responsavel: "Bancos BR", alvo: "2T 2026", status: "Em andamento", notas: "Roadshow em curso" },
    { titulo: "Início do CAPEX da planta Floresta", categoria: "Construção", responsavel: "Ativa", alvo: "Pós-SBLC", status: "Bloqueado", notas: "Dependência da SBLC" },
    { titulo: "Regularização fundiária da Fazenda Panamá", categoria: "Fundiário", responsavel: "Ativa", alvo: "1T 2026", status: "Bloqueado", notas: "Aguarda limites" },
    { titulo: "Fencing Exu / Panamá", categoria: "Fundiário", responsavel: "Ativa", alvo: "1T 2026", status: "Aberto" },
    { titulo: "Aquisição Tiasa e Tiper", categoria: "M&A", responsavel: "Ore", alvo: "2026", status: "Em avaliação", notas: "Veículo separado" },
    { titulo: "Decisão de arquitetura de implantação", categoria: "Estratégica", responsavel: "BoD Ativa + Ore", alvo: "1S 2026", status: "Aberto", notas: "Modular vs escala" },
    { titulo: "Exit logic — primeiro racional", categoria: "Estratégica", responsavel: "Sócios Ore", alvo: "2S 2026", status: "Aberto" },
    { titulo: "Publicação pública do EIA/RIMA", categoria: "Licenciamento", responsavel: "Ativa", alvo: "Dez 2025", status: "Concluído", notas: "Publicado em 10/dez/25" },
    { titulo: "EIA/RIMA — mina completa", categoria: "Licenciamento", responsavel: "CPRH", alvo: "Ago–dez 2025", status: "Concluído", notas: "Aceito em dez/25" },
    { titulo: "RAIPA — arqueológico da mina completa", categoria: "Licenciamento", responsavel: "IPHAN", alvo: "Jun 2025", status: "Concluído", notas: "Aprovado" },
    { titulo: "Testes metalúrgicos", categoria: "Engenharia", responsavel: "Jupeng / Steinert / Inbras", alvo: "2025", status: "Concluído", notas: "Process design final" },
    { titulo: "Aprovação de crédito BNB", categoria: "Financiamento", responsavel: "BNB", alvo: "2025", status: "Concluído", notas: "Aguarda SBLC" },
    { titulo: "Engenharia detalhada — planta", categoria: "Engenharia", responsavel: "Jupeng + contratados", alvo: "Em andamento", status: "Em andamento", notas: "Processo Jupeng escolhido" },
    { titulo: "LP + LI Floresta — planta de stockpiles", categoria: "Licenciamento", responsavel: "CPRH", alvo: "2024", status: "Concluído", notas: "Permite 180 kt/ano" },
  ],
  destaques: [
    { rotulo: "IRR estimado (original)", texto: "33%" },
    { rotulo: "MOIC estimado (original)", texto: "6,5x" },
    { rotulo: "Início da construção", texto: "2025" },
    { rotulo: "Start-up", texto: "2026" },
    { rotulo: "Vida útil de mina", texto: "~12 anos" },
    { rotulo: "Estratégias de saída", texto: "Dividendos durante cerca de 12 anos, com potencial de M&A ou IPO após plena capacidade." },
    { rotulo: "Preços — TiO₂ conc. CIF", texto: "USD 130–340/t" },
    { rotulo: "Preços — Fe Ore CFR", texto: "USD 110–133/t" },
    { rotulo: "Preços — Vanádio FOB", texto: "USD 6,1–7,8/lb" },
  ],
};

/* ── NZR Gold · aba "9. KPI NZR Gold" ───────────────────────────────────── */

/** Sensibilidade de recursos ao cut-off grade (NI 43-101). Só a NZR tem. */
export interface PontoCutOff {
  cutOffGt: number;
  toneladasMil: number;
  auGt: number;
  auOncas: number;
}

export const NZR_CUTOFF: PontoCutOff[] = [
  { cutOffGt: 0.15, toneladasMil: 56409, auGt: 0.39, auOncas: 710907 },
  { cutOffGt: 0.3, toneladasMil: 20830, auGt: 0.69, auOncas: 464464 },
  { cutOffGt: 0.5, toneladasMil: 10279, auGt: 1.03, auOncas: 341970 },
  { cutOffGt: 0.7, toneladasMil: 6802, auGt: 1.26, auOncas: 275795 },
  { cutOffGt: 1, toneladasMil: 2696, auGt: 1.8, auOncas: 156399 },
  { cutOffGt: 1.5, toneladasMil: 1289, auGt: 2.57, auOncas: 106459 },
];

const NZR: KpiInvestida = {
  slug: "nazareno-gold",
  nomeFonte: "NZR Gold (Nazareno / Gamba)",
  source: SOURCES.kpiNzr,
  snapshot: {
    costBasisUSD: 3850, fairValueUSD: 9155, unrealizedUSD: 5305,
    tvpi: 2.377922077922078, ownership: 0.5298,
    fase: "NI 43-101 + estudos econômicos",
    status: "NI 43-101 atualizado / Estudos econômicos / Market sounding",
  },
  ficha: [
    { rotulo: "Local", valor: "Minas Gerais — Nazareno (Quadrilátero Ferrífero)" },
    { rotulo: "Metros sondados totais", valor: "27.500 m cumulativos" },
    { rotulo: "Recursos — cut-off 0,15 g/t", valor: "56,4 Mt @ 0,39 g/t Au = ~710 koz" },
    { rotulo: "Recursos — cut-off 0,50 g/t", valor: "10,3 Mt @ 1,03 g/t Au = ~342 koz (near-surface)" },
    { rotulo: "Investimento do Fundo", valor: "USD 3,85M de USD 5M chamados (Phase 3.2 pendente: USD 1,15M)" },
    { rotulo: "Fair value Q4/25", valor: "USD 9,2M — valorização de +138% sobre o custo" },
    { rotulo: "Fase atual", valor: "Studies / trade-off para PEA-PFS atualizados em 2026" },
    { rotulo: "Configuração preferencial", valor: "Open-pit only com low-OPEX plant, grade-alvo acima de 1 g/t, flexibilidade UG se o ouro subir" },
    { rotulo: "Potenciais compradores", valor: "Aura, Jaguar, Cerrado Gold, Goldmining (majors latam)" },
  ],
  marcos: [
    { titulo: "Trade-off studies DMT", responsavel: "DMT", alvo: "1S 2026", status: "Em andamento", notas: "Open-pit + heap leach low-CAPEX" },
    { titulo: "Business plan para potenciais interessados", responsavel: "Sócios Ore", alvo: "1S 2026", status: "Em andamento" },
    { titulo: "Market sounding avançado", responsavel: "Sócios Ore", alvo: "1S 2026", status: "Em andamento", notas: "2 ou mais interessados em paralelo" },
    { titulo: "Decisão sobre configuração", responsavel: "Sócios Ore", alvo: "1S 2026", status: "Aberto" },
    { titulo: "Atualização PEA/PFS", responsavel: "Equipe técnica", alvo: "2026", status: "Aberto" },
    { titulo: "Escolha formal: desenvolver vs vender o pacote", responsavel: "Sócios Ore", alvo: "3T 2026", status: "Aberto" },
    { titulo: "Decisão de inclusão das áreas Neeo no pacote", responsavel: "Sócios Ore", alvo: "2T 2026", status: "Aberto" },
    { titulo: "Execução de transação", responsavel: "Sócios Ore", alvo: "2026–2027", status: "Aberto", notas: "Cash + earn-outs + royalty" },
    { titulo: "Phase 3.2 — decisão go/no-go", responsavel: "Sócios Ore", alvo: "A definir", status: "Aberto", notas: "USD 1,15M em aberto" },
    { titulo: "NI 43-101 atualizado — release", responsavel: "Equipe técnica", alvo: "Out 2025", status: "Concluído", notas: "~710 koz" },
  ],
};

/* ── Rio Novo / IOCG Norte · aba "10. KPI IOCG Norte" ───────────────────── */

/**
 * Escada do earn-in com a Centaurus Metals. Valores em AUD milhares — moeda
 * da contraparte australiana, preservada como a fonte registra (D6).
 * `atribuivelAUD` é `null` na linha do royalty: ali a fonte declara um
 * percentual (0,5% NSR), não um valor.
 */
export interface EstagioEarnIn {
  estagio: string;
  atribuivelAUD: Fornecido<number>;
  acumuladoAUD: Fornecido<number>;
  commitment: string;
  comentario: string;
}

export const IOCG_EARN_IN: EstagioEarnIn[] = [
  { estagio: "Signing (out/25)", atribuivelAUD: 21.25, acumuladoAUD: 21, commitment: "Full transfer of Mineral Right", comentario: "One-off closing payment" },
  { estagio: "12 meses", atribuivelAUD: 42.5, acumuladoAUD: 64, commitment: "Mín. exploração AUD 850 k", comentario: "Go / no-go; o direito reverte se não avançar" },
  { estagio: "24 meses", atribuivelAUD: 85, acumuladoAUD: 149, commitment: "Mín. exploração AUD 850 k", comentario: "Go / no-go; o direito reverte se não avançar" },
  { estagio: "JORC ≥ 100 kt CuEq (42 m)", atribuivelAUD: 850, acumuladoAUD: 999, commitment: "Success payment (≥ 50% em ações CTM)", comentario: "Vinculado a recurso JORC" },
  { estagio: "Mining license granted (ANM)", atribuivelAUD: 850, acumuladoAUD: 1849, commitment: "Success payment (≥ 50% em ações CTM)", comentario: "Vinculado à aprovação ambiental" },
  { estagio: "Royalty / 25% dos proceeds se vendido", atribuivelAUD: null, acumuladoAUD: null, commitment: "Optionality de conversão de 25% na revenda", comentario: "0,5% NSR — upside de longo prazo" },
];

const IOCG: KpiInvestida = {
  slug: "rio-novo",
  nomeFonte: "IOCG Norte (Rio Novo / Centaurus earn-in)",
  source: SOURCES.kpiIocg,
  snapshot: {
    costBasisUSD: 801, fairValueUSD: 801, unrealizedUSD: 0,
    tvpi: 1, ownership: 1,
    fase: "Exploration (Centaurus earn-in)",
    status: "Earn-in com Centaurus executado em out/25 — monitoramento contratual",
  },
  ficha: [
    { rotulo: "Local", valor: "Pará — Curionópolis (Carajás)" },
    { rotulo: "Commodities", valor: "Cobre, ouro, ferro" },
    { rotulo: "Investimento original", valor: "USD 750 k por 30% (Phase 1)" },
    { rotulo: "Aquisição de 100%", valor: "USD 51 k (com exit proceeds 50/50 com os acionistas originais)" },
    { rotulo: "Parceiro atual", valor: "Centaurus Metals (CTM) — earn-in staged" },
    { rotulo: "Data do deal Centaurus", valor: "Out 2025 — partial exit" },
    { rotulo: "Estrutura do acordo", valor: "Pagamentos por milestones + NSR de 0,5% de royalty" },
    { rotulo: "Upside residual da Ore", valor: "Milestones + NSR + reversão se o parceiro não avançar" },
  ],
  destaques: [
    { rotulo: "Cadência de reporting contratual", texto: "Semestral — relatórios da Centaurus." },
    { rotulo: "Governança", texto: "Rastreio de progresso contra os minimum work commitments." },
    { rotulo: "Critério “em dia vs fora do trilho”", texto: "A definir formalmente em 2026." },
    { rotulo: "Atividade atual da Centaurus", texto: "Drilling diamantino retomado em Boi Novo–Rio Novo; extensões Cu-Au." },
    { rotulo: "Plano de ação em caso de desvio", texto: "Pressionar, cobrar, preparar reversão e re-marketing." },
    { rotulo: "Próximo reporting da Centaurus", texto: "1º semestre de 2026." },
  ],
};

/* ── Alvo Minerals · aba "11. KPI Alvo" ─────────────────────────────────── */

/**
 * Trajetória de posição — a Alvo é a única cuja PARTICIPAÇÃO muda ao longo do
 * tempo (diluição de 19,9% para 9,56% em quatro trimestres), e é isso que o
 * dashboard dela precisa mostrar.
 *
 * ⚠️ Esta aba registra ownership de 9,56% no Q4 2025. O CONFLITO-03 continua
 * em aberto: outros documentos divergem sobre fair value e ownership da Alvo,
 * e nenhum valor foi eleito. A série abaixo é o que ESTA aba reporta.
 */
export interface PontoPosicaoAlvo {
  trimestre: string;
  ownership: number;
  fairValueUSD: number;
}

export const ALVO_TRAJETORIA: PontoPosicaoAlvo[] = [
  { trimestre: "Q4 2024", ownership: 0.199, fairValueUSD: 721 },
  { trimestre: "Q1 2025", ownership: 0.199, fairValueUSD: 960 },
  { trimestre: "Q2 2025", ownership: 0.119, fairValueUSD: 337 },
  { trimestre: "Q3 2025", ownership: 0.119, fairValueUSD: 416 },
  { trimestre: "Q4 2025", ownership: 0.0956, fairValueUSD: 1248 },
];

const ALVO: KpiInvestida = {
  slug: "alvo-minerals",
  nomeFonte: "Alvo Minerals Limited (TSX:ALV)",
  source: SOURCES.kpiAlvo,
  snapshot: {
    costBasisUSD: 2643, fairValueUSD: 1248, unrealizedUSD: -1395,
    tvpi: 0.47219069239500566,
    /* CONFLITO-03 em aberto: esta aba registra 9,56%, a AGM registra 19,9%.
       Nenhum valor foi eleito — o snapshot da investida não afirma participação. */
    ownership: null,
    fase: "Early-Stage Exploration",
    status: "Early-Stage Exploration — diluído; hold com gatilhos vs exit a decidir",
  },
  ficha: [
    { rotulo: "Listagem", valor: "TSX:ALV" },
    { rotulo: "Ownership registrado nesta aba", valor: "9,56% (diluído de 19,9% no Q1 2025)" },
    { rotulo: "Projeto principal (flagship)", valor: "Palma VMS — Zn, Cu, Pb, Ag (Tocantins)" },
    { rotulo: "Projetos REE", valor: "Bluebush (próximo a Serra Verde), Iporá (próximo a Aclara)" },
    { rotulo: "Recursos Palma (jul 2024)", valor: "7,6 Mt @ 0,7% Cu, 3,4% Zn, 0,5% Pb (+65% vs 2021)" },
    { rotulo: "Evento relevante 2025", valor: "Tentativa frustrada de aquisição da Lavra Velha (Pan American Silver)" },
    { rotulo: "Cap raises — a Ore não participou", valor: "Q2 2025: AUD 1,56M. Q4 2025: AUD 2,26M (AUD 0,049/ação)" },
    { rotulo: "Target exploratório atual", valor: "Touro (5 furos diamantados, 548 m, mineralização confirmada)" },
    { rotulo: "Assays iniciais de Touro", valor: "Primeiros publicados em jan/2026 — validação inicial" },
  ],
  marcos: [
    { titulo: "Drilling avançado em Touro (Palma)", responsavel: "Alvo", alvo: "2026", status: "Em andamento" },
    { titulo: "Resultados de assays — novos targets", responsavel: "Alvo", alvo: "1S 2026", status: "Aberto" },
    { titulo: "Definir nível de envolvimento da Ore", responsavel: "Sócios Ore", alvo: "2T 2026", status: "Aberto", notas: "Board seat com remuneração?" },
    { titulo: "Decisão: hold com gatilhos vs exit", responsavel: "Sócios Ore", alvo: "2T 2026", status: "Aberto", notas: "0,5–1,0x do capital = sucesso?" },
    { titulo: "Alternativa estratégica (take-private?)", responsavel: "Sócios Ore / Alvo", alvo: "2026", status: "Em avaliação" },
    { titulo: "Saída via block trading (se for o caso)", responsavel: "Sócios Ore", alvo: "2026–2029", status: "Aberto" },
    { titulo: "Liquidação ou venda (se 2029 sem re-rating)", responsavel: "Sócios Ore", alvo: "2029", status: "Aberto", notas: "Critério-gatilho de longo prazo" },
  ],
};

/* ── Neeo Minerals · aba "12. KPI Neeo" ─────────────────────────────────── */

const NEEO: KpiInvestida = {
  slug: "neeo-exploration",
  nomeFonte: "Neeo Minerals",
  source: SOURCES.kpiNeeo,
  snapshot: {
    costBasisUSD: 153, fairValueUSD: 153, unrealizedUSD: 0,
    tvpi: 1, ownership: 1,
    fase: "Early-Stage Exploration",
    status: "Early-Stage Exploration — burn rate mínimo; JV / desinvestimento",
  },
  ficha: [
    { rotulo: "Commodities", valor: "Ouro, cobre, titânio" },
    { rotulo: "Ownership", valor: "100%" },
    { rotulo: "Investimento total", valor: "USD 153 k" },
    { rotulo: "Fase atual", valor: "Early-Stage Exploration" },
    { rotulo: "Status operacional", valor: "Burn rate mínimo — preservação de caixa" },
    { rotulo: "Áreas relevantes", valor: "2 áreas de ouro + 1 área de titânio" },
  ],
  destaques: [
    { rotulo: "Rota A — venda / JV standalone", texto: "Pacote mínimo de dados. Target: juniores exploradoras." },
    { rotulo: "Rota B — empacotar ouro com a NZR", texto: "Aumentar massa crítica; ampliar o universo de compradores; majors latam." },
    { rotulo: "Rota C — área de titânio para a Tiasa", texto: "Potencial cessão ao veículo de aquisição Tiasa / Tiper." },
    { rotulo: "Preservação de upside", texto: "Estrutura com earn-outs / royalty mesmo em cenário de zero cash-out." },
  ],
  marcos: [
    { titulo: "Montagem do pacote mínimo de dados (Au)", responsavel: "Equipe técnica Ore", alvo: "2T 2026", status: "Aberto" },
    { titulo: "Decisão: bundle com NZR vs standalone", responsavel: "Sócios Ore", alvo: "2T 2026", status: "Aberto" },
    { titulo: "Pré-marketing a juniores", responsavel: "Sócios Ore", alvo: "2S 2026", status: "Aberto" },
    { titulo: "Cessão de área de Ti ao veículo Tiasa", responsavel: "Sócios Ore", alvo: "Condicional", status: "Aberto", notas: "Dependência da Tiasa" },
    { titulo: "Data limite para manter direitos no Fundo 1", responsavel: "Sócios Ore", alvo: "A definir", status: "Aberto", notas: "Evitar ativo zumbi" },
    { titulo: "Catalisador para descarte", responsavel: "Sócios Ore", alvo: "A definir", status: "Aberto" },
    { titulo: "Execução de venda / JV / cessão", responsavel: "Sócios Ore", alvo: "2026–2027", status: "Aberto", notas: "Zero cash-out com earn-out é aceitável" },
  ],
};

export const KPIS: Record<InvestidaSlug, KpiInvestida> = {
  "morro-verde": MORRO_VERDE,
  "ativa-mineracao": ATIVA,
  "nazareno-gold": NZR,
  "rio-novo": IOCG,
  "alvo-minerals": ALVO,
  "neeo-exploration": NEEO,
};

export function kpiDe(slug: string): KpiInvestida | undefined {
  return KPIS[slug as InvestidaSlug];
}

/* ═══════════════ COCKPIT DO PORTFÓLIO · aba "3. Dashboard" ═══════════════
 * Data de referência: 31/dez/2025. Status e tese são preenchidos à mão pela
 * Ore na planilha (campos editáveis); o resto puxa da Base de Dados. */

export type StatusAtivo = "No trilho" | "Atenção" | "Fora do trilho";
export type EstadoTese = "Válida" | "Revisada" | "Inválida";

export interface LinhaCockpit {
  slug: InvestidaSlug;
  /** Nome como a aba do cockpit escreve. */
  nome: string;
  status: StatusAtivo;
  tese: EstadoTese;
  /** USD '000 */
  costBasisUSD: number;
  fairValueUSD: number;
  /** Variação do fair value no trimestre, USD '000, como a fonte registra. */
  varFvQoQUSD: number;
  /** Dry powder alocado a este ativo, USD '000. */
  dryPowderUSD: number;
  proximoMarco: string;
  nota: string;
  ultimaAtualizacao: string;
}

export const COCKPIT: LinhaCockpit[] = [
  {
    slug: "morro-verde", nome: "Morro Verde", status: "Fora do trilho", tese: "Revisada",
    costBasisUSD: 20253, fairValueUSD: 14847, varFvQoQUSD: -7321, dryPowderUSD: 0,
    proximoMarco: "Integração Massari + ramp-up de calcário",
    nota: "Turnaround em curso; dívida elevada; NewCo Massari em jan/2026.",
    ultimaAtualizacao: "Abr 2026",
  },
  {
    slug: "ativa-mineracao", nome: "Ativa Mineração", status: "Atenção", tese: "Válida",
    costBasisUSD: 9000, fairValueUSD: 11286, varFvQoQUSD: 1957, dryPowderUSD: 0,
    proximoMarco: "SBLC / desembolso BNB / audiência pública",
    nota: "Licenciamento avançando; financiamento é o caminho crítico.",
    ultimaAtualizacao: "Abr 2026",
  },
  {
    slug: "nazareno-gold", nome: "NZR Gold", status: "Atenção", tese: "Revisada",
    costBasisUSD: 3850, fairValueUSD: 9155, varFvQoQUSD: 1813, dryPowderUSD: 1150,
    proximoMarco: "Trade-off + decisão de configuração open-pit",
    nota: "NI 43-101 atualizado em 710 koz; market sounding iniciado.",
    ultimaAtualizacao: "Abr 2026",
  },
  {
    slug: "rio-novo", nome: "IOCG Norte", status: "No trilho", tese: "Válida",
    costBasisUSD: 801, fairValueUSD: 801, varFvQoQUSD: 0, dryPowderUSD: 0,
    proximoMarco: "Milestones do earn-in Centaurus",
    nota: "Earn-in em out/2025; monitoramento contratual.",
    ultimaAtualizacao: "Abr 2026",
  },
  {
    slug: "alvo-minerals", nome: "Alvo Minerals", status: "Fora do trilho", tese: "Revisada",
    costBasisUSD: 2643, fairValueUSD: 1248, varFvQoQUSD: 832, dryPowderUSD: 0,
    proximoMarco: "Catalisador de re-rating ou rota de saída",
    nota: "Marked to market; diluído para 9,56%; hold com gatilhos.",
    ultimaAtualizacao: "Abr 2026",
  },
  {
    slug: "neeo-exploration", nome: "Neeo Minerals", status: "Fora do trilho", tese: "Revisada",
    costBasisUSD: 153, fairValueUSD: 153, varFvQoQUSD: 76, dryPowderUSD: 0,
    proximoMarco: "Decisão de JV / venda / bundle com a NZR",
    nota: "Burn mínimo; risco de ativo zumbi.",
    ultimaAtualizacao: "Abr 2026",
  },
];

/**
 * Totais como a linha TOTAL da aba registra. Transcritos, NÃO recalculados:
 * a soma de `varFvQoQUSD` das seis linhas não bate com o total (−2.643) que a
 * planilha exibe. A divergência é da fonte e fica visível — recalcular aqui
 * seria corrigir a planilha por conta própria.
 */
export const COCKPIT_TOTAIS = {
  costBasisUSD: 36700,
  fairValueUSD: 37490,
  varFvQoQUSD: -2643,
  dryPowderUSD: 1150,
  source: { ...SOURCES.dashboard, cell: "E13:H13" } as SourceRef,
};

/* ═══════════════ POSIÇÃO DO FUNDO · abas "1. Capa" e "4. Capital e Caixa" ══ */

export const FUNDO = {
  /** USD '000 */
  commitmentsUSD: 55349,
  paidInUSD: 45909,
  percentCalled: 0.8299,
  balanceToBeCalledUSD: 9440,
  cashBalanceUSD: 1679,
  unrealizedValueUSD: 37490,
  distribuicoesUSD: 0,
  totalValueUSD: 39170,
  tvpiNet: 0.85,
  tvpiGross: 1.0215258855585831,
  dpi: 0,
  numeroInvestimentos: 6,
  asOf: "2025-12-31",
  source: SOURCES.fundo,
} as const;

/** Composição do portfólio por ativo — fração do valor não realizado. */
export const COMPOSICAO: { slug: InvestidaSlug; nome: string; fracao: number }[] = [
  { slug: "morro-verde", nome: "Morro Verde", fracao: 0.3960256068284876 },
  { slug: "ativa-mineracao", nome: "Ativa Mineração", fracao: 0.3010402774073086 },
  { slug: "nazareno-gold", nome: "NZR Gold", fracao: 0.24419845292077888 },
  { slug: "rio-novo", nome: "IOCG Norte", fracao: 0.021365697519338492 },
  { slug: "alvo-minerals", nome: "Alvo Minerals", fracao: 0.0332888770338757 },
  { slug: "neeo-exploration", nome: "Neeo Minerals", fracao: 0.004081088290210723 },
];

/** Uso do capital chamado, cumulativo até Q4 2025 (USD '000 e % do paid-in). */
export const USO_DO_CAPITAL: { rubrica: string; valorUSD: number; fracaoPaidIn: number }[] = [
  { rubrica: "Investimentos (cumulativo)", valorUSD: 36620, fracaoPaidIn: 0.79766494587118 },
  { rubrica: "Management fee (cumulativo)", valorUSD: 5663, fracaoPaidIn: 0.12335271951033566 },
  { rubrica: "Despesas e due diligences", valorUSD: 1973, fracaoPaidIn: 0.042976322725391536 },
  { rubrica: "Saldo de caixa", valorUSD: 1679, fracaoPaidIn: 0.03657234964821712 },
];

export const DRY_POWDER = {
  investableUSD: 42500,
  investidoUSD: 36620,
  compromissoPendenteNzrUSD: 1150,
  totalCommittedUSD: 37770,
  dryPowderUSD: 4730,
  nota: "Contingência para NZR, Ativa e/ou Morro Verde. Desde o início de 2024 há discussões ativas com 2 alvos de aquisição com sinergia com a Ativa (abaixo de USD 3M).",
  source: SOURCES.capital,
} as const;

/** Evolução anual do fundo. FX é o câmbio de referência de cada ano-fim. */
export interface AnoDoFundo {
  ano: string;
  commitmentsUSD: number;
  paidInUSD: number;
  percentCalled: number;
  cashBalanceUSD: number;
  investimentos: number;
  fxBrlPorUsd: number;
}

export const EVOLUCAO_FUNDO: AnoDoFundo[] = [
  { ano: "Q4 2020", commitmentsUSD: 46800, paidInUSD: 1498, percentCalled: 0.032, cashBalanceUSD: 451, investimentos: 0, fxBrlPorUsd: 5.1967 },
  { ano: "Q4 2021", commitmentsUSD: 47670, paidInUSD: 4910, percentCalled: 0.103, cashBalanceUSD: 362, investimentos: 2, fxBrlPorUsd: 5.5805 },
  { ano: "Q4 2022", commitmentsUSD: 55349, paidInUSD: 9431, percentCalled: 0.17, cashBalanceUSD: 883, investimentos: 4, fxBrlPorUsd: 5.2177 },
  { ano: "Q4 2023", commitmentsUSD: 55349, paidInUSD: 27964, percentCalled: 0.505, cashBalanceUSD: 944, investimentos: 5, fxBrlPorUsd: 4.8413 },
  { ano: "Q4 2024", commitmentsUSD: 55349, paidInUSD: 38393, percentCalled: 0.6435, cashBalanceUSD: 1604, investimentos: 6, fxBrlPorUsd: 6.1923 },
  { ano: "Q4 2025", commitmentsUSD: 55349, paidInUSD: 45909, percentCalled: 0.8299, cashBalanceUSD: 1679, investimentos: 6, fxBrlPorUsd: 5.5024 },
];

/** Leitura de situação escrita pela própria Ore na Capa do workbook. */
export const ONDE_ESTAMOS: string[] = [
  "Período de investimento encerrado em nov/2024. Fundo em fase de criação de valor e desinvestimento.",
  "94% do portfólio concentrado em 3 ativos: Morro Verde (40%), Ativa (30%) e NZR Gold (24%).",
  "Morro Verde: turnaround em curso, transação com a Massari assinada em jan/2026, valuation −37% vs 2024.",
  "Ativa Mineração: EIA/RIMA aceito pelo CPRH; aguardando SBLC para destravar o financiamento do BNB e o CAPEX.",
  "NZR Gold: NI 43-101 confirma cerca de 710 koz de ouro; trade-off studies em curso, market sounding iniciado.",
  "IOCG Norte: earn-in com a Centaurus executado em out/2025; monitoramento contratual de milestones.",
  "Alvo Minerals (TSX:ALV): posição diluída para 9,56%; hold com gatilhos ou rota de saída a decidir.",
  "Neeo Minerals: burn rate mínimo; JV/venda ou bundle com a NZR em avaliação.",
];

/** Estado do dado destes conjuntos: transcrição literal de documento da Ore. */
export const KPI_DATA_STATUS: DataStatus = "REAL";
