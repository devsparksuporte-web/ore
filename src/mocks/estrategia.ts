/**
 * MOCK · domínio Strategy (Estratégia & Execução).
 * Semeado a partir do workbook de gestão da Ore. Ativos alinhados às investidas
 * reais de @/mocks/companies (IOCG Norte ↔ Rio Novo; "Fundo 1" é nível-portfólio).
 *
 * ⚠️ Acesso proibido a partir de componentes — leia SEMPRE via @modules/strategy.
 * Este arquivo é o "adaptador mock"; no E5 é substituído por @modules/api sem
 * alterar assinaturas do port.
 */
import type {
  AssetRef, Decision, ExitPlan, StrategicMap, StrategyEvent,
} from "@/modules/strategy/types";

/* ───────────────────────────── Ativos ───────────────────────────── */

const A: Record<string, AssetRef> = {
  morroverde: { id: "c-morroverde", label: "Morro Verde", companySlug: "morro-verde" },
  ativa: { id: "c-ativa", label: "Ativa Mineração", companySlug: "ativa-mineracao" },
  nzr: { id: "c-nazareno", label: "NZR Gold", companySlug: "nazareno-gold" },
  iocg: { id: "c-rionovo", label: "IOCG Norte", companySlug: "rio-novo" },
  alvo: { id: "c-alvo", label: "Alvo Minerals", companySlug: "alvo-minerals" },
  neeo: { id: "c-neeo", label: "Neeo Minerals", companySlug: "neeo-exploration" },
  fundo1: { id: "fund-1", label: "Fundo 1" },
};

/* ───────────────────── Estratégia da Investida ───────────────────── */

export const strategicMaps: StrategicMap[] = [
  {
    id: "map-morroverde",
    asset: A.morroverde,
    thesisOriginal:
      "Aquisição da Massari para consolidar posição em calcário e fosfato e capturar sinergias operacionais com a plataforma existente.",
    thesis:
      "Execução do turnaround pós-Massari. Redução de alavancagem (<3.0x). Ramp-up de calcário e fosfato com P300/CEMIG. Integração operacional e comercial. Meta de saída 2029–2030.",
    criticalPath: [
      { label: "Transação Massari assinada", done: true },
      { label: "Integração — plano 100 dias", current: true },
      { label: "Reperfilamento de dívida (<3.0x)" },
      { label: "Break-even e geração de caixa" },
    ],
    objectives: [
      "Capturar sinergias de receita e custo da integração",
      "Reduzir alavancagem para menos de 3.0x Net Debt/EBITDA",
      "Estabelecer reporting institucional auditável (exit readiness)",
    ],
    keyRisks: [
      { label: "Integração / sinergias operacionais abaixo do esperado", severity: "high" },
      { label: "Insucesso na redução da alavancagem e reperfilamento de dívidas", severity: "critical" },
      { label: "Perda de controle de métricas-chave no Conselho", severity: "medium" },
      { label: "Sem break-even e geração de caixa após dívidas", severity: "critical" },
    ],
    success:
      "Break-even e geração de caixa sustentada ao longo do ano. Integração rodando com KPIs claros; metas anuais cumpridas. Reporting institucional auditável. Início de exit readiness (controles, narrativa, métricas comparáveis).",
    decision:
      "Aprovar plano de negócios e orçamento 2026. Definir 3–5 KPIs chave do Conselho e gatilhos de correção.",
  },
  {
    id: "map-ativa",
    asset: A.ativa,
    thesisOriginal:
      "Desenvolver o projeto Floresta (planta + mina) como ativo produtor, financiado por BNB e estruturado para venda a trader e mercado.",
    thesis:
      "Planta Floresta: obter garantia, alocar financiamento BNB, construir e operar. Mina: LP e LI, CAPEX via caixa/equity/dívida. Aquisição Tiasa e Tiper por veículo separado. Venda ~50% trader / ~50% mercado.",
    criticalPath: [
      { label: "EIA/RIMA e vistoria CPRH", done: true },
      { label: "Audiência pública", current: true },
      { label: "Destravar SBLC → desembolso BNB" },
      { label: "CAPEX fase 1 (construção)" },
      { label: "Operação e ramp-up" },
    ],
    objectives: [
      "Resolver licenças-chave e audiência pública",
      "Destravar funding e garantias (SBLC / BNB)",
      "Definir arquitetura de implantação e estratégia de capital",
    ],
    keyRisks: [
      { label: "Gargalo de garantias / funding atrasar o cronograma (Planta Floresta)", severity: "critical" },
      { label: "Licenciamento, condicionantes e temas fundiários no caminho crítico", severity: "high" },
      { label: "Risco técnico-comercial (recuperação / qualidade, demanda / preço)", severity: "high" },
    ],
    success:
      "Licenças-chave e audiência pública resolvidas. Funding e garantias destravados. CAPEX fase 1 iniciado com cronograma realista. Exit logic definida (quem compra, em que estágio, qual gatilho).",
    decision:
      "Escolher formalmente a arquitetura de implantação (modular vs escala). Definir estratégia de capital (caixa / dívida / equity / M&A). Iniciar racional de saída no longo prazo.",
  },
  {
    id: "map-nzr",
    asset: A.nzr,
    thesisOriginal:
      "Explorar o depósito Gamba (ouro) e destravar valor por descoberta e expansão de recursos.",
    thesis:
      "Avaliação de economicidade do Gamba continua. Se inviável no desenho atual, monetizar como ativo em exploração: vender pacote de direitos com upside de descoberta / expansão de recursos. Incluir áreas de Au da Neeo se adicionar valor / liquidez.",
    criticalPath: [
      { label: "Trade-off studies (DMT)", current: true },
      { label: "Definir configuração técnica" },
      { label: "Market sounding (2+ interessados)" },
      { label: "Transação (venda / JV / farm-out)" },
    ],
    objectives: [
      "Concluir estudos e definir configuração de menor CAPEX",
      "Montar business plan para potenciais interessados",
      "Executar transação preservando upside (earn-outs / royalty)",
    ],
    keyRisks: [
      { label: "Universo de compradores limitado; comparáveis M&A fracos", severity: "high" },
      { label: "Percepção de estágio inicial; fora de métricas de mercado (>1 Moz, >1 g/t)", severity: "medium" },
      { label: "Falta de visão clara para plano de criação e captura de valor", severity: "medium" },
    ],
    success:
      "Business plan montado para potenciais interessados. Transação executada (venda / JV / farm-out) com liquidez imediata + preservação de upside (earn-outs / royalty atrelados a marcos). Idealmente 2+ interessados em paralelo (Aura, Jaguar, Cerrado Gold, Goldmining).",
    decision:
      "Conclusão dos estudos em andamento. Escolher formalmente a estratégia a seguir com a Companhia e busca ativa pelo desinvestimento.",
  },
  {
    id: "map-iocg",
    asset: A.iocg,
    thesisOriginal:
      "Farm-out do ativo IOCG para parceiro (Centaurus) executar o programa exploratório e gerar dados.",
    thesis:
      "Acompanhamento e monitoramento do acordo com Centaurus. Desenvolvimento de Plano B (devolução do ativo se parceiro não avançar). Governança e monitoramento contratual para não perder timing.",
    criticalPath: [
      { label: "Deal Centaurus assinado", done: true },
      { label: "Formalizar cessão ANM", current: true },
      { label: "Monitorar execução do programa" },
      { label: "Decidir: avançar vs reverter" },
    ],
    objectives: [
      "Formalizar cessão de direitos na ANM",
      "Definir critérios objetivos de acompanhamento do parceiro",
      "Preservar timing e opção de reversão (Plano B)",
    ],
    keyRisks: [
      { label: "Parceiro não cumprir / decidir não avançar (retorno sem monetização)", severity: "high" },
      { label: "Atrasos no programa do parceiro reduzirem o ritmo do acordo", severity: "medium" },
      { label: "Assimetria de informação e reação tardia a desvios", severity: "medium" },
    ],
    success:
      "Parceiro executando programa e gerando dados com visibilidade real de avanço para próximos estágios. Resultados positivos do programa exploratório do parceiro.",
    decision:
      "Definir critérios objetivos de 'em dia vs fora do trilho'. Plano de ação: pressionar, cobrar, ou preparar reversão e re-marketing.",
  },
  {
    id: "map-alvo",
    asset: A.alvo,
    thesisOriginal:
      "Posição minoritária listada, mantida à espera de re-rating de mercado ou alternativa estratégica.",
    thesis:
      "Posição menor e marcada a mercado; manter aguardando re-rating ou alternativa estratégica. Saída via block trading ou gradual. Se até 2029 não houver valorização, desenvolver alternativas de liquidação / venda.",
    criticalPath: [
      { label: "Posição marcada a mercado", done: true },
      { label: "Definir hold com gatilhos vs saída", current: true },
      { label: "Buscar catalisador / janela de liquidez" },
      { label: "Reduzir ou encerrar exposição" },
    ],
    objectives: [
      "Definir nível de envolvimento e contribuição à Companhia",
      "Estabelecer gatilhos objetivos de hold vs saída",
      "Encontrar janela de liquidez (block trade ou gradual)",
    ],
    keyRisks: [
      { label: "Sem catalisador, risco de dispender atenção sem retorno ('ativo zumbi')", severity: "high" },
      { label: "Diluição recorrente e financiamento em mercado fraco", severity: "medium" },
      { label: "Liquidez baixa e falta de janela de saída", severity: "high" },
      { label: "Eventual falência / recuperação judicial (Austrália ou Brasil)", severity: "critical" },
    ],
    success:
      "Milestone material que gere re-rating, OU alternativa estratégica / saída encaminhada.",
    decision:
      "Definir nível de envolvimento e contribuição à Companhia. 'Hold com gatilhos' (quais?) vs 'rota de saída' (reduzir exposição / encerrar posição). Retorno de 0,5 a 1,0x capital seria sucesso?",
  },
  {
    id: "map-neeo",
    asset: A.neeo,
    thesisOriginal:
      "Portfólio de direitos minerários em exploração (ouro e titânio) a ser monetizado via JV ou venda.",
    thesis:
      "Manter burn rate mínimo e buscar JV / desinvestimento com upside. Rotas não-excludentes: (i) venda / JV standalone com pacote mínimo de dados; (ii) empacotar 2 áreas de ouro junto com NZR. Área de titânio para eventual veículo Tiasa.",
    criticalPath: [
      { label: "Manter burn rate mínimo", current: true },
      { label: "Montar pacote mínimo de dados" },
      { label: "Buscar JV / comprador (ou empacotar c/ NZR)" },
      { label: "Cessão / venda" },
    ],
    objectives: [
      "Preservar opcionalidade com custo mínimo",
      "Tornar as áreas 'vendáveis' (dado mínimo)",
      "Realizar venda ou cessão com exposição a upside",
    ],
    keyRisks: [
      { label: "Permanecer 'não vendável' por falta de dado / sondagem ou baixa atratividade", severity: "high" },
      { label: "Virar 'ativo zumbi' (tempo + custo) sem aumentar probabilidade de monetização", severity: "critical" },
      { label: "Transmissão de imagem negativa sobre competência de construção de portfólio", severity: "medium" },
    ],
    success:
      "Realização de venda ou cessão, mesmo com zero cash-out e exposição a eventual upside.",
    decision:
      "Até qual data esses direitos minerários serão mantidos no portfólio do Fundo 1? Qual seria o catalisador para descarte das áreas?",
  },
];

/* ────────────────────────── Plano de Saída ────────────────────────── */

export const exitPlans: ExitPlan[] = [
  {
    id: "exit-morroverde", asset: A.morroverde, strategy: "Venda estratégica / trade sale",
    stages: [{ label: "Turnaround" }, { label: "Estruturação" }, { label: "Exit readiness" }, { label: "Saída" }],
    currentStageIndex: 0,
    nextSteps: ["Concluir integração e capturar sinergias", "Atingir break-even e estabilizar caixa", "Preparar narrativa e métricas comparáveis"],
    horizon: "2029–2030",
  },
  {
    id: "exit-ativa", asset: A.ativa, strategy: "Venda a estratégico (~50% trader / ~50% mercado)",
    stages: [{ label: "Licenciamento" }, { label: "Funding" }, { label: "Construção" }, { label: "Operação" }, { label: "Saída" }],
    currentStageIndex: 1,
    nextSteps: ["Resolver audiência pública e condicionantes", "Destravar SBLC e desembolso BNB", "Definir arquitetura de implantação e racional de saída"],
    horizon: "2030–2032",
  },
  {
    id: "exit-nzr", asset: A.nzr, strategy: "Venda do pacote / JV / farm-out",
    stages: [{ label: "Estudos" }, { label: "Business plan" }, { label: "Market sounding" }, { label: "Transação" }],
    currentStageIndex: 0,
    nextSteps: ["Concluir trade-off studies (DMT)", "Montar business plan para interessados", "Rodar market sounding com 2+ alvos em paralelo"],
    horizon: "2026–2027",
  },
  {
    id: "exit-iocg", asset: A.iocg, strategy: "Monetização via parceiro (Centaurus) ou reversão",
    stages: [{ label: "Farm-out" }, { label: "Monitoramento" }, { label: "Decisão avançar/reverter" }, { label: "Saída" }],
    currentStageIndex: 1,
    nextSteps: ["Formalizar cessão ANM", "Acompanhar programa exploratório do parceiro", "Definir gatilhos de reversão e re-marketing"],
    horizon: "2027–2028",
  },
  {
    id: "exit-alvo", asset: A.alvo, strategy: "Block trade ou saída gradual em mercado",
    stages: [{ label: "Hold" }, { label: "Gatilhos" }, { label: "Janela de liquidez" }, { label: "Saída" }],
    currentStageIndex: 1,
    nextSteps: ["Definir hold com gatilhos vs rota de saída", "Monitorar catalisadores de re-rating", "Preparar execução de redução de posição"],
    horizon: "até 2029",
  },
  {
    id: "exit-neeo", asset: A.neeo, strategy: "JV / cessão / venda (standalone ou com NZR)",
    stages: [{ label: "Burn mínimo" }, { label: "Pacote de dados" }, { label: "Busca de comprador" }, { label: "Cessão" }],
    currentStageIndex: 0,
    nextSteps: ["Manter burn rate mínimo", "Montar pacote mínimo de dados", "Avaliar empacotamento com NZR"],
    horizon: "2026–2027",
  },
];

/* ───────────────────────── Timeline (execução) ───────────────────────── */

export const strategyTimeline: Record<string, StrategyEvent[]> = {
  "ativa-mineracao": [
    { id: "tl-ativa-1", dateISO: "2026-01-29", dateLabel: "Jan/2026", title: "Vistoria CPRH concluída", kind: "delivery", state: "done" },
    { id: "tl-ativa-2", dateISO: "2026-02-28", dateLabel: "Fev/2026", title: "Audiência pública (pós EIA/RIMA)", kind: "milestone", state: "current" },
    { id: "tl-ativa-3", dateISO: "2026-04-30", dateLabel: "Abr/2026", title: "Destravar SBLC para desembolso BNB", kind: "milestone", state: "upcoming" },
    { id: "tl-ativa-4", dateISO: "2026-06-30", dateLabel: "Jun/2026", title: "Escolher arquitetura de implantação", kind: "decision", state: "upcoming" },
    { id: "tl-ativa-5", dateISO: "2026-09-30", dateLabel: "Set/2026", title: "Iniciar racional de saída", kind: "decision", state: "upcoming" },
  ],
  "morro-verde": [
    { id: "tl-mv-1", dateISO: "2026-01-15", dateLabel: "Jan/2026", title: "Transação Massari assinada", kind: "delivery", state: "done" },
    { id: "tl-mv-2", dateISO: "2026-03-31", dateLabel: "Mar/2026", title: "Aprovar plano de negócios e orçamento 2026", kind: "decision", state: "current" },
    { id: "tl-mv-3", dateISO: "2026-04-30", dateLabel: "Abr/2026", title: "Integração — plano 100 dias", kind: "milestone", state: "upcoming" },
    { id: "tl-mv-4", dateISO: "2026-06-30", dateLabel: "Jun/2026", title: "Rolagem de dívida (<3.0x)", kind: "milestone", state: "upcoming" },
  ],
  "nazareno-gold": [
    { id: "tl-nzr-1", dateISO: "2026-06-30", dateLabel: "Jun/2026", title: "Concluir trade-off studies (DMT)", kind: "milestone", state: "current" },
    { id: "tl-nzr-2", dateISO: "2026-06-30", dateLabel: "Jun/2026", title: "Market sounding — 2+ interessados", kind: "milestone", state: "upcoming" },
    { id: "tl-nzr-3", dateISO: "2026-09-30", dateLabel: "Set/2026", title: "Escolher desenvolvimento vs venda", kind: "decision", state: "upcoming" },
  ],
  "rio-novo": [
    { id: "tl-iocg-1", dateISO: "2025-10-01", dateLabel: "Out/2025", title: "Deal Centaurus fechado", kind: "delivery", state: "done" },
    { id: "tl-iocg-2", dateISO: "2026-06-30", dateLabel: "Jun/2026", title: "Formalizar cessão ANM", kind: "milestone", state: "current" },
    { id: "tl-iocg-3", dateISO: "2026-06-30", dateLabel: "Jun/2026", title: "Definir critérios de acompanhamento", kind: "decision", state: "upcoming" },
  ],
  "alvo-minerals": [
    { id: "tl-alvo-1", dateISO: "2026-06-30", dateLabel: "Jun/2026", title: "Decidir hold com gatilhos vs saída", kind: "decision", state: "current" },
    { id: "tl-alvo-2", dateISO: "2026-06-30", dateLabel: "Jun/2026", title: "Avaliar participação em Board", kind: "decision", state: "upcoming" },
  ],
  "neeo-exploration": [
    { id: "tl-neeo-1", dateISO: "2026-09-30", dateLabel: "Set/2026", title: "Empacotar áreas Au com NZR", kind: "decision", state: "current" },
    { id: "tl-neeo-2", dateISO: "2026-12-31", dateLabel: "Dez/2026", title: "Data limite p/ manter direitos", kind: "decision", state: "upcoming" },
  ],
};

/* ───────────────────────── Decisões & Ações ───────────────────────── */

export const decisions: Decision[] = [
  { id: "dec-1", ref: 1, asset: A.morroverde, title: "Integração Massari — plano 100 dias", context: "Capturar sinergias de receita/custos, otimizar estrutura de capital. Transação assinada Jan/2026.", type: "action", priority: "high", owner: "CEO NewCo (Saurin)", dueDate: "30/04/2026", dueDateISO: "2026-04-30", status: "in_progress", lastUpdate: "Abr/2026" },
  { id: "dec-2", ref: 2, asset: A.morroverde, title: "Rolagem de dívida e redução de alavancagem", context: "Reperfilamento pós-deal Massari. Target: <3.0x Net Debt/EBITDA.", type: "action", priority: "high", owner: "CFO NewCo", dueDate: "30/06/2026", dueDateISO: "2026-06-30", status: "in_progress", lastUpdate: "Abr/2026" },
  { id: "dec-3", ref: 3, asset: A.ativa, title: "Destravar SBLC (carta fiança) para desbloquear BNB", context: "Roadshow com bancos brasileiros. Sem SBLC, não sai desembolso BNB.", type: "action", priority: "high", owner: "CEO Ativa + Ore", dueDate: "30/04/2026", dueDateISO: "2026-04-30", status: "in_progress", lastUpdate: "Abr/2026" },
  { id: "dec-4", ref: 4, asset: A.ativa, title: "Audiência pública CPRH (pós EIA/RIMA)", context: "Agendada provisoriamente para Fev/2026. Vistoria CPRH 28–29/Jan/2026.", type: "action", priority: "high", owner: "Ativa + consultores", dueDate: "28/02/2026", dueDateISO: "2026-02-28", status: "in_progress", lastUpdate: "Abr/2026" },
  { id: "dec-5", ref: 5, asset: A.nzr, title: "Concluir trade-off studies (DMT) e definir configuração", context: "Open-pit + heap leach low-CAPEX é a hipótese atual.", type: "action", priority: "high", owner: "Equipe técnica + DMT", dueDate: "30/06/2026", dueDateISO: "2026-06-30", status: "in_progress", lastUpdate: "Abr/2026" },
  { id: "dec-6", ref: 6, asset: A.nzr, title: "Market sounding — 2+ interessados em paralelo", context: "Aura, Jaguar, Cerrado Gold, Goldmining como alvos potenciais.", type: "action", priority: "medium", owner: "Sócios Ore", dueDate: "30/06/2026", dueDateISO: "2026-06-30", status: "in_progress", lastUpdate: "Abr/2026" },
  { id: "dec-7", ref: 7, asset: A.iocg, title: "Formalizar ANM — cessão de direitos para Centaurus", context: "Processo formal em curso após deal Out/2025.", type: "action", priority: "medium", owner: "Jurídico Ore", dueDate: "30/06/2026", dueDateISO: "2026-06-30", status: "in_progress", lastUpdate: "Abr/2026" },
  { id: "dec-8", ref: 8, asset: A.fundo1, title: "Plano de comunicação aos cotistas sobre redução de valuation MV", context: "Carta já enviada Jan/2026. Manter cadência de updates.", type: "action", priority: "medium", owner: "IR Ore", dueDate: "Contínuo", status: "in_progress", lastUpdate: "Abr/2026" },
  { id: "dec-9", ref: 9, asset: A.morroverde, title: "Aprovar plano de negócios e orçamento 2026", context: "Novo plano elaborado pela nova gestão pós-turnaround 2H25. Aprovar em Conselho.", type: "decision", priority: "high", owner: "Conselho MV", dueDate: "31/03/2026", dueDateISO: "2026-03-31", status: "open", lastUpdate: "Mar/2026" },
  { id: "dec-10", ref: 10, asset: A.morroverde, title: "Definir 3–5 KPIs chave do Conselho e gatilhos de correção", context: "Reporting institucional auditável; metas anuais; exit readiness.", type: "decision", priority: "high", owner: "CFO Ore + MV", dueDate: "31/03/2026", dueDateISO: "2026-03-31", status: "open", lastUpdate: "Mar/2026" },
  { id: "dec-11", ref: 11, asset: A.ativa, title: "Escolher arquitetura de implantação (modular vs escala)", context: "Definir formalmente + estratégia de capital (caixa/dívida/equity/M&A).", type: "decision", priority: "high", owner: "BoD Ativa", dueDate: "30/06/2026", dueDateISO: "2026-06-30", status: "open", lastUpdate: "Mar/2026" },
  { id: "dec-12", ref: 12, asset: A.ativa, title: "Regularização fundiária Fazenda Panamá", context: "Pausado aguardando clarificação de limites. Retomada início 2026.", type: "action", priority: "medium", owner: "Ativa", dueDate: "31/03/2026", dueDateISO: "2026-03-31", status: "blocked", lastUpdate: "Mar/2026" },
  { id: "dec-13", ref: 13, asset: A.ativa, title: "Iniciar racional de saída (quem compra, em que estágio, qual gatilho)", context: "Lista de potenciais estratégicos, narrativa de venda, timing.", type: "decision", priority: "medium", owner: "Sócios Ore", dueDate: "30/09/2026", dueDateISO: "2026-09-30", status: "open", lastUpdate: "Mar/2026" },
  { id: "dec-14", ref: 14, asset: A.nzr, title: "Escolher estratégia: desenvolvimento vs venda do pacote", context: "Decisão formal após conclusão dos estudos.", type: "decision", priority: "high", owner: "Sócios Ore", dueDate: "30/09/2026", dueDateISO: "2026-09-30", status: "open", lastUpdate: "Mar/2026" },
  { id: "dec-15", ref: 15, asset: A.iocg, title: "Definir critérios 'em dia vs fora do trilho' Centaurus", context: "Monitorar via relatórios semestrais. Gatilhos para pressionar/cobrar/reverter.", type: "decision", priority: "medium", owner: "Sócios Ore", dueDate: "30/06/2026", dueDateISO: "2026-06-30", status: "open", lastUpdate: "Mar/2026" },
  { id: "dec-16", ref: 16, asset: A.alvo, title: "Decidir: hold com gatilhos vs rota de saída", context: "Posição 9,56%. Definir se 0,5–1,0x capital é sucesso aceitável.", type: "decision", priority: "medium", owner: "Sócios Ore", dueDate: "30/06/2026", dueDateISO: "2026-06-30", status: "open", lastUpdate: "Mar/2026" },
  { id: "dec-17", ref: 17, asset: A.alvo, title: "Avaliar participação em Board com remuneração", context: "Reduzir tempo investido se não há catalisador claro.", type: "decision", priority: "low", owner: "Sócios Ore", dueDate: "30/06/2026", dueDateISO: "2026-06-30", status: "open", lastUpdate: "Mar/2026" },
  { id: "dec-18", ref: 18, asset: A.neeo, title: "Data limite para manter direitos minerários no Fundo 1", context: "Burn rate mínimo, mas evitar 'ativo zumbi'.", type: "decision", priority: "medium", owner: "Sócios Ore", dueDate: "31/12/2026", dueDateISO: "2026-12-31", status: "open", lastUpdate: "Mar/2026" },
  { id: "dec-19", ref: 19, asset: A.neeo, title: "Empacotar áreas Au com NZR (ou venda standalone)", context: "Rotas não excludentes. Áreas de Ti poderiam ir para veículo Tiasa.", type: "decision", priority: "medium", owner: "Sócios Ore", dueDate: "30/09/2026", dueDateISO: "2026-09-30", status: "open", lastUpdate: "Mar/2026" },
  { id: "dec-20", ref: 20, asset: A.fundo1, title: "Captações / Fundo 2 — decisão de iniciar ou não", context: "Depende de performance de saídas e apetite de LPs.", type: "decision", priority: "low", owner: "Sócios Ore", dueDate: "31/12/2026", dueDateISO: "2026-12-31", status: "open", lastUpdate: "Mar/2026" },
];
