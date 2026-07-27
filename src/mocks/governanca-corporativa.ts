/**
 * MOCK · domínio Governança Corporativa (Sprint 1.3).
 * Snapshots por investida (estrutura, contratos, obrigações, riscos, timeline,
 * compliance), alinhados às empresas de @/mocks/companies. Data-base 30/06/2026.
 *
 * ⚠️ Acesso proibido a partir de componentes — leia SEMPRE via
 * @modules/corporate-governance. Adaptador "mock"; no E5 é substituído por
 * @modules/api (ou importador de Excel do Data Room) sem alterar o port.
 */
import type { GovernanceSnapshot } from "@/modules/corporate-governance/types";

export const governanceSnapshots: GovernanceSnapshot[] = [
  {
    assetId: "c-ativa", companySlug: "ativa-mineracao", entityType: "S.A. de capital fechado", jurisdiction: "Brasil (BR)", asOf: "2026-06-30",
    bodies: [
      {
        id: "b-dir", kind: "executive", name: "Diretoria estatutária",
        members: [
          { name: "João Nogueira", role: "Diretor-presidente", mandate: "2025–2027", isPresident: true },
          { name: "Marina Alves", role: "Diretora financeira", mandate: "2025–2027" },
          { name: "Ricardo Sette", role: "Diretor de operações", mandate: "2025–2027" },
        ],
      },
      {
        id: "b-cons", kind: "board", name: "Conselho de administração",
        members: [
          { name: "Victor da Mata", role: "Presidente do conselho", mandate: "até 2027" },
          { name: "Ana Prado", role: "Conselheira", mandate: "até 2027" },
          { name: "Carlos Bueno", role: "Conselheiro", mandate: "até 2027" },
          { name: "Helena Reis", role: "Conselheira independente", mandate: "até 2027" },
          { name: "Paulo Tavares", role: "Conselheiro", mandate: "até 2027" },
        ],
      },
      { id: "b-audit", kind: "committee", name: "Comitê de auditoria", members: [{ name: "Helena Reis", role: "Coordenadora" }, { name: "Ana Prado", role: "Membro" }, { name: "Externo", role: "Especialista" }] },
      { id: "b-inv", kind: "committee", name: "Comitê de investimentos", members: [{ name: "Victor da Mata", role: "Coordenador" }, { name: "Carlos Bueno", role: "Membro" }, { name: "Marina Alves", role: "Membro" }, { name: "Paulo Tavares", role: "Membro" }] },
    ],
    contracts: [
      {
        id: "k-acionistas", name: "Acordo de acionistas", type: "shareholders",
        object: "Direitos e obrigações entre acionistas: governança, tag/drag along, quóruns e política de dividendos.",
        parties: ["Fundo Ore I", "Sócios fundadores", "Ativa Mineração S.A."],
        executiveSummary: "Vigente e cumprido. Quóruns qualificados para decisões relevantes; tag along de 100%. Sem pendências.",
        keyObligations: ["Aprovar orçamento anual em conselho", "Respeitar quórum qualificado para novo endividamento", "Reporte trimestral aos acionistas"],
        status: "fulfilled", responsible: "Jurídico Ore", updatedAt: "2026-06-10",
        nextEvents: [{ dateLabel: "Set/2026", title: "Revisão da política de dividendos" }],
      },
      {
        id: "k-bnb", name: "Financiamento BNB", type: "investment",
        object: "Linha de financiamento do Banco do Nordeste para a Planta Floresta, condicionada a garantias (SBLC).",
        parties: ["Banco do Nordeste", "Ativa Mineração S.A."],
        executiveSummary: "Desembolso condicionado à SBLC ainda não emitida. Aditivo de garantia em atraso — risco de cronograma.",
        keyObligations: ["Emitir SBLC até o desembolso", "Comprovar licenças ambientais", "Aplicar recursos conforme cronograma físico-financeiro"],
        status: "at_risk", responsible: "CFO Ativa + Jurídico Ore", updatedAt: "2026-06-28",
        nextEvents: [{ dateLabel: "30/04/2026", title: "Aditivo de garantia (vencido)" }, { dateLabel: "Ago/2026", title: "Primeiro desembolso previsto" }],
      },
      {
        id: "k-tiasa", name: "SPA earn-out Tiasa", type: "divestment",
        object: "Compra e venda de participação com componente de earn-out atrelado a marcos operacionais.",
        parties: ["Ativa Mineração S.A.", "Tiasa Participações"],
        executiveSummary: "Em revisão de cláusulas de earn-out. Divergência sobre marcos de gatilho; jurídico em negociação.",
        keyObligations: ["Definir marcos de earn-out", "Auditoria de fechamento", "Liberação de escrow"],
        status: "pending", responsible: "Jurídico Ore", updatedAt: "2026-06-20",
        nextEvents: [{ dateLabel: "Jul/2026", title: "Rodada de revisão de cláusulas" }],
      },
      {
        id: "k-fundiario", name: "Regularização fundiária Fazenda Panamá", type: "other",
        object: "Regularização de limites e titularidade da área da Fazenda Panamá.",
        parties: ["Ativa Mineração S.A.", "Cartório / ANM"],
        executiveSummary: "Pausado aguardando clarificação de limites. Retomada prevista sem impacto imediato de caixa.",
        keyObligations: ["Levantamento topográfico", "Registro em cartório"],
        status: "pending", responsible: "Jurídico Ativa", updatedAt: "2026-05-30",
        nextEvents: [{ dateLabel: "2026", title: "Retomada do processo" }],
      },
      {
        id: "k-offtake", name: "Contrato de off-take", type: "investment",
        object: "Compromisso de compra da produção por trader internacional (~50%).",
        parties: ["Ativa Mineração S.A.", "Trader internacional"],
        executiveSummary: "Vigente e cumprido. Preços indexados a benchmark; volumes conforme ramp-up.",
        keyObligations: ["Entregar volumes mínimos", "Cumprir especificação de qualidade"],
        status: "fulfilled", responsible: "Comercial Ativa", updatedAt: "2026-06-15",
        nextEvents: [],
      },
    ],
    obligations: [
      { id: "o-sblc", title: "Emitir SBLC para desembolso BNB", owner: "CFO Ativa", dueDate: "30/04/2026", dueDateISO: "2026-04-30", status: "overdue", area: "contratual", contractRef: "k-bnb" },
      { id: "o-fund", title: "Registro fundiário Fazenda Panamá", owner: "Jurídico Ativa", dueDate: "31/03/2026", dueDateISO: "2026-03-31", status: "overdue", area: "societário", contractRef: "k-fundiario" },
      { id: "o-earnout", title: "Definir marcos de earn-out Tiasa", owner: "Jurídico Ore", dueDate: "31/07/2026", dueDateISO: "2026-07-31", status: "due_soon", area: "contratual", contractRef: "k-tiasa" },
      { id: "o-reporte", title: "Reporte trimestral aos acionistas", owner: "RI Ore", dueDate: "15/08/2026", dueDateISO: "2026-08-15", status: "on_track", area: "societário", contractRef: "k-acionistas" },
    ],
    risks: [
      { id: "r-soc", label: "Divergência societária sobre earn-out pode escalar a arbitragem", severity: "critical", area: "societário" },
      { id: "r-amb", label: "Condicionantes ambientais no caminho crítico do licenciamento", severity: "high", area: "ambiental" },
      { id: "r-trib", label: "Contingência tributária em discussão administrativa", severity: "medium", area: "tributário" },
    ],
    timeline: [
      { id: "e-1", dateISO: "2026-01-20", dateLabel: "Jan/2026", title: "Assembleia geral ordinária", kind: "assembly", state: "done" },
      { id: "e-2", dateISO: "2026-04-30", dateLabel: "Abr/2026", title: "Aditivo de garantia BNB (vencido)", kind: "amendment", state: "current" },
      { id: "e-3", dateISO: "2026-07-31", dateLabel: "Jul/2026", title: "Revisão de cláusulas earn-out Tiasa", kind: "decision", state: "upcoming" },
      { id: "e-4", dateISO: "2026-09-30", dateLabel: "Set/2026", title: "Revisão da política de dividendos", kind: "decision", state: "upcoming" },
    ],
    compliance: { total: 40, fulfilled: 38, pending: 2, overdue: 2, updatedAt: "2026-07-10", responsible: "Jurídico Ore" },
  },

  /* ───────── demais investidas (compactas, válidas) ───────── */
  {
    assetId: "c-morroverde", companySlug: "morro-verde", entityType: "S.A. de capital fechado", jurisdiction: "Brasil (BR)", asOf: "2026-06-30",
    bodies: [
      { id: "mv-dir", kind: "executive", name: "Diretoria estatutária", members: [{ name: "Saurin Melo", role: "CEO", mandate: "2025–2028", isPresident: true }, { name: "Diretor financeiro", role: "CFO", mandate: "2025–2028" }] },
      { id: "mv-cons", kind: "board", name: "Conselho de administração", members: [{ name: "Victor da Mata", role: "Presidente do conselho" }, { name: "Membro", role: "Conselheiro" }, { name: "Membro", role: "Conselheiro" }] },
      { id: "mv-audit", kind: "committee", name: "Comitê de auditoria", members: [{ name: "Membro", role: "Coordenador" }, { name: "Membro", role: "Membro" }] },
    ],
    contracts: [
      { id: "mv-massari", name: "Aquisição Massari", type: "investment", object: "Compra de ativos e passivos da Massari.", parties: ["Morro Verde", "Massari"], executiveSummary: "Assinado e em integração. Sem pendências relevantes.", keyObligations: ["Integração 100 dias", "Reperfilamento de dívida"], status: "fulfilled", responsible: "Jurídico Ore", updatedAt: "2026-06-01", nextEvents: [] },
      { id: "mv-divida", name: "Reperfilamento de dívida", type: "other", object: "Renegociação do endividamento.", parties: ["Morro Verde", "Bancos"], executiveSummary: "Em negociação; covenants em revisão.", keyObligations: ["Atingir <3,0x Net Debt/EBITDA"], status: "pending", responsible: "CFO NewCo", updatedAt: "2026-06-20", nextEvents: [{ dateLabel: "Jun/2026", title: "Assinatura do reperfilamento" }] },
    ],
    obligations: [
      { id: "mv-o1", title: "Cumprir covenant de alavancagem", owner: "CFO NewCo", dueDate: "30/06/2026", dueDateISO: "2026-06-30", status: "due_soon", area: "contratual" },
      { id: "mv-o2", title: "Aprovar orçamento 2026 em conselho", owner: "Conselho MV", dueDate: "31/03/2026", dueDateISO: "2026-03-31", status: "fulfilled", area: "societário" },
    ],
    risks: [{ id: "mv-r1", label: "Insucesso no reperfilamento de dívida", severity: "high", area: "contratual" }],
    timeline: [
      { id: "mv-e1", dateISO: "2026-01-15", dateLabel: "Jan/2026", title: "Fechamento aquisição Massari", kind: "decision", state: "done" },
      { id: "mv-e2", dateISO: "2026-06-30", dateLabel: "Jun/2026", title: "Assinatura do reperfilamento", kind: "amendment", state: "current" },
    ],
    compliance: { total: 22, fulfilled: 21, pending: 1, overdue: 0, updatedAt: "2026-07-05", responsible: "Jurídico Ore" },
  },
  {
    assetId: "c-nazareno", companySlug: "nazareno-gold", entityType: "S.A. de capital fechado", jurisdiction: "Brasil (BR)", asOf: "2026-06-30",
    bodies: [
      { id: "nz-dir", kind: "executive", name: "Diretoria estatutária", members: [{ name: "Diretor-presidente", role: "CEO", isPresident: true }, { name: "Diretor técnico", role: "CTO" }] },
      { id: "nz-cons", kind: "board", name: "Conselho de administração", members: [{ name: "Victor da Mata", role: "Presidente do conselho" }, { name: "Membro", role: "Conselheiro" }] },
    ],
    contracts: [{ id: "nz-jv", name: "Memorando de entendimento (farm-out)", type: "divestment", object: "Negociação de venda/JV do pacote de direitos.", parties: ["NZR Gold", "Interessados"], executiveSummary: "Em prospecção; sem vínculo definitivo.", keyObligations: ["Concluir due diligence técnica"], status: "pending", responsible: "Sócios Ore", updatedAt: "2026-06-18", nextEvents: [{ dateLabel: "Set/2026", title: "Decisão desenvolvimento vs venda" }] }],
    obligations: [{ id: "nz-o1", title: "Concluir trade-off studies (DMT)", owner: "Equipe técnica", dueDate: "30/06/2026", dueDateISO: "2026-06-30", status: "due_soon", area: "contratual" }],
    risks: [{ id: "nz-r1", label: "Universo de compradores limitado", severity: "medium", area: "contratual" }],
    timeline: [{ id: "nz-e1", dateISO: "2026-06-30", dateLabel: "Jun/2026", title: "Conclusão dos estudos DMT", kind: "decision", state: "current" }],
    compliance: { total: 12, fulfilled: 12, pending: 0, overdue: 0, updatedAt: "2026-07-01", responsible: "Jurídico Ore" },
  },
  {
    assetId: "c-rionovo", companySlug: "rio-novo", entityType: "S.A. de capital fechado", jurisdiction: "Brasil (BR)", asOf: "2026-06-30",
    bodies: [
      { id: "rn-dir", kind: "executive", name: "Diretoria estatutária", members: [{ name: "Diretor-presidente", role: "CEO", isPresident: true }] },
      { id: "rn-cons", kind: "board", name: "Conselho de administração", members: [{ name: "Victor da Mata", role: "Presidente do conselho" }, { name: "Membro", role: "Conselheiro" }] },
    ],
    contracts: [{ id: "rn-centaurus", name: "Cessão de direitos Centaurus", type: "divestment", object: "Cessão de direitos minerários ao parceiro Centaurus.", parties: ["IOCG Norte", "Centaurus"], executiveSummary: "Formalização em curso na ANM; monitoramento contratual.", keyObligations: ["Formalizar cessão na ANM", "Acompanhar programa do parceiro"], status: "pending", responsible: "Jurídico Ore", updatedAt: "2026-06-12", nextEvents: [{ dateLabel: "Jun/2026", title: "Formalização ANM" }] }],
    obligations: [{ id: "rn-o1", title: "Formalizar cessão na ANM", owner: "Jurídico Ore", dueDate: "30/06/2026", dueDateISO: "2026-06-30", status: "due_soon", area: "societário" }],
    risks: [{ id: "rn-r1", label: "Parceiro pode não avançar com o programa", severity: "high", area: "contratual" }],
    timeline: [{ id: "rn-e1", dateISO: "2025-10-01", dateLabel: "Out/2025", title: "Deal Centaurus assinado", kind: "decision", state: "done" }, { id: "rn-e2", dateISO: "2026-06-30", dateLabel: "Jun/2026", title: "Formalização ANM", kind: "amendment", state: "current" }],
    compliance: { total: 8, fulfilled: 7, pending: 1, overdue: 0, updatedAt: "2026-07-02", responsible: "Jurídico Ore" },
  },
  {
    assetId: "c-alvo", companySlug: "alvo-minerals", entityType: "Companhia listada (ASX)", jurisdiction: "Austrália (AU)", asOf: "2026-06-30",
    bodies: [
      { id: "al-dir", kind: "executive", name: "Diretoria (board executivo)", members: [{ name: "Managing Director", role: "MD", isPresident: true }] },
      { id: "al-cons", kind: "board", name: "Board of Directors", members: [{ name: "Chairman", role: "Chairman" }, { name: "Ore (assento)", role: "Non-exec director" }, { name: "Membro", role: "Director" }] },
    ],
    contracts: [{ id: "al-pos", name: "Posição acionária (9,56%)", type: "investment", object: "Participação minoritária listada, marcada a mercado.", parties: ["Fundo Ore I", "Alvo Minerals"], executiveSummary: "Posição em hold com gatilhos; sem obrigações contratuais relevantes.", keyObligations: ["Cumprir regras de disclosure de participação"], status: "fulfilled", responsible: "Jurídico Ore", updatedAt: "2026-06-05", nextEvents: [] }],
    obligations: [{ id: "al-o1", title: "Disclosure de participação (ASX)", owner: "Jurídico Ore", dueDate: "contínuo", status: "on_track", area: "societário" }],
    risks: [{ id: "al-r1", label: "Liquidez baixa e ausência de janela de saída", severity: "high", area: "societário" }],
    timeline: [{ id: "al-e1", dateISO: "2026-06-30", dateLabel: "Jun/2026", title: "Decisão hold vs saída", kind: "decision", state: "current" }],
    compliance: { total: 6, fulfilled: 6, pending: 0, overdue: 0, updatedAt: "2026-07-03", responsible: "Jurídico Ore" },
  },
  {
    assetId: "c-neeo", companySlug: "neeo-exploration", entityType: "Ltda", jurisdiction: "Brasil (BR)", asOf: "2026-06-30",
    bodies: [
      { id: "ne-dir", kind: "executive", name: "Administração", members: [{ name: "Administrador", role: "Sócio-administrador", isPresident: true }] },
      { id: "ne-cons", kind: "board", name: "Comitê gestor (Fundo 1)", members: [{ name: "Victor da Mata", role: "Coordenador" }, { name: "Membro", role: "Membro" }] },
    ],
    contracts: [{ id: "ne-pack", name: "Pacote de direitos minerários", type: "divestment", object: "Direitos de exploração (ouro e titânio) para monetização.", parties: ["Neeo", "Fundo 1"], executiveSummary: "Aguardando pacote mínimo de dados para JV/venda.", keyObligations: ["Montar dados mínimos", "Manter titularidade dos direitos"], status: "pending", responsible: "Sócios Ore", updatedAt: "2026-06-08", nextEvents: [{ dateLabel: "Dez/2026", title: "Data limite para manter direitos" }] }],
    obligations: [{ id: "ne-o1", title: "Manutenção anual dos direitos (ANM)", owner: "Jurídico Ore", dueDate: "31/12/2026", dueDateISO: "2026-12-31", status: "on_track", area: "societário" }],
    risks: [{ id: "ne-r1", label: "Direitos podem virar 'ativo zumbi' sem monetização", severity: "medium", area: "societário" }],
    timeline: [{ id: "ne-e1", dateISO: "2026-12-31", dateLabel: "Dez/2026", title: "Data limite para manter direitos", kind: "decision", state: "upcoming" }],
    compliance: { total: 5, fulfilled: 5, pending: 0, overdue: 0, updatedAt: "2026-07-01", responsible: "Jurídico Ore" },
  },
];
