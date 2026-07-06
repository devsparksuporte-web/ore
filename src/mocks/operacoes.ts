import type { ApprovalItem, PurchaseOrder, Supplier } from "@/types/domain";

export const purchaseFunnel = [
  { stage: "Solicitações", count: 34, value: 4_900_000 },
  { stage: "Aprovadas", count: 21, value: 3_400_000 },
  { stage: "Pedidos emitidos", count: 18, value: 3_100_000 },
  { stage: "Recebidas", count: 12, value: 2_050_000 },
];

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: "po-2214", number: "PC-2214", date: "2026-06-24", requester: "C. Duarte", supplier: "MinerParts Ltda",
    category: "Manutenção", costCenter: "320 · Manutenção", amount: 720_000, status: "pending_approval",
    agingDays: 8, currentApprover: "CFO (alçada > R$ 500k)",
    items: [
      { description: "Revestimento moinho SAG — jogo completo", qty: 1, unitPrice: 540_000 },
      { description: "Kit rolamentos + vedação", qty: 4, unitPrice: 45_000 },
    ],
    timeline: [
      { step: "Solicitação criada", who: "C. Duarte", when: "24/06 09:12", status: "done" },
      { step: "Aprovação gestor (≤ 100k por item)", who: "R. Meireles", when: "25/06 14:30", status: "done" },
      { step: "Aprovação CFO (> 500k)", who: "Bruna M. Cruz", status: "current" },
      { step: "Emissão no Protheus", who: "Suprimentos", status: "waiting" },
    ],
    budgetBalance: { account: "Manutenção — 320", available: 310_000, committed: 1_890_000 },
  },
  {
    id: "po-2201", number: "PC-2201", date: "2026-06-18", requester: "P. Lopes", supplier: "Locadora HeavyMaq",
    category: "Locação", costCenter: "310 · Planta", amount: 1_150_000, status: "approved",
    agingDays: 3,
    items: [{ description: "Locação escavadeira CAT 374 — 6 meses", qty: 6, unitPrice: 191_667 }],
    timeline: [
      { step: "Solicitação criada", who: "P. Lopes", when: "18/06 10:02", status: "done" },
      { step: "Aprovação gestor", who: "R. Meireles", when: "18/06 16:44", status: "done" },
      { step: "Aprovação CFO", who: "Bruna M. Cruz", when: "20/06 09:15", status: "done" },
      { step: "Emissão no Protheus", who: "Suprimentos", status: "current" },
    ],
    budgetBalance: { account: "Operação planta — 310", available: 890_000, committed: 3_200_000 },
  },
  {
    id: "po-2198", number: "PC-2198", date: "2026-06-15", requester: "P. Lopes", supplier: "Transportadora Rota Norte",
    category: "Frete", costCenter: "410 · Logística", amount: 940_000, status: "issued", agingDays: 2,
    items: [{ description: "Frete concentrado — lote jun/26", qty: 42, unitPrice: 22_381 }],
    timeline: [
      { step: "Solicitação criada", who: "P. Lopes", when: "15/06", status: "done" },
      { step: "Aprovações concluídas", who: "Alçadas", when: "16/06", status: "done" },
      { step: "Pedido emitido", who: "Suprimentos", when: "17/06", status: "done" },
      { step: "Recebimento", who: "Logística", status: "current" },
    ],
  },
  {
    id: "po-2187", number: "PC-2187", date: "2026-06-08", requester: "R. Meireles", supplier: "Reagentes Nordeste",
    category: "Insumos", costCenter: "310 · Planta", amount: 486_000, status: "received", agingDays: 0,
    items: [{ description: "Reagente flotação — 12 t", qty: 12, unitPrice: 40_500 }],
    timeline: [
      { step: "Fluxo completo", who: "—", when: "08–14/06", status: "done" },
      { step: "Recebido", who: "Almoxarifado", when: "14/06", status: "done" },
    ],
  },
  {
    id: "po-2219", number: "SC-0781", date: "2026-06-27", requester: "A. Santos", supplier: "EPI Segurança Total",
    category: "SSMA", costCenter: "100 · Corporativo", amount: 84_000, status: "pending_approval", agingDays: 5,
    currentApprover: "Gestor de área",
    items: [{ description: "EPIs — reposição semestral", qty: 1, unitPrice: 84_000 }],
    timeline: [
      { step: "Solicitação criada", who: "A. Santos", when: "27/06", status: "done" },
      { step: "Aprovação gestor", who: "R. Meireles", status: "current" },
    ],
    budgetBalance: { account: "SSMA — 100", available: 126_000, committed: 84_000 },
  },
];

export const suppliers: Supplier[] = [
  { id: "s1", name: "MinerParts Ltda", taxId: "12.345.678/0001-90", category: "Manutenção", volume12m: 6_400_000, concentrationPct: 22, lastOrder: "24/06/2026", rating: 4 },
  { id: "s2", name: "Enel Distribuição PE", taxId: "08.324.196/0001-81", category: "Energia", volume12m: 21_300_000, concentrationPct: 43, lastOrder: "01/06/2026" },
  { id: "s3", name: "Transportadora Rota Norte", taxId: "23.456.789/0001-12", category: "Frete", volume12m: 5_100_000, concentrationPct: 17, lastOrder: "15/06/2026", rating: 5 },
  { id: "s4", name: "Reagentes Nordeste", taxId: "34.567.890/0001-23", category: "Insumos", volume12m: 4_800_000, concentrationPct: 16, lastOrder: "08/06/2026", rating: 4 },
  { id: "s5", name: "Locadora HeavyMaq", taxId: "45.678.901/0001-34", category: "Locação", volume12m: 3_900_000, concentrationPct: 13, lastOrder: "18/06/2026", rating: 3 },
];

export const approvalQueue: ApprovalItem[] = [
  { id: "ap-1", type: "purchase", description: "PC-2214 · Revestimento moinho SAG — MinerParts", requester: "C. Duarte", costCenter: "320", amount: 720_000, waitingDays: 8, slaStatus: "overdue", withinAuthority: true, orderId: "po-2214" },
  { id: "ap-2", type: "purchase", description: "SC-0781 · EPIs reposição semestral", requester: "A. Santos", costCenter: "100", amount: 84_000, waitingDays: 5, slaStatus: "warning", withinAuthority: true, orderId: "po-2219" },
  { id: "ap-3", type: "justification", description: "Justificativa · Energia elétrica +23,8% (jun)", requester: "R. Meireles", costCenter: "310", amount: 380_000, waitingDays: 3, slaStatus: "ok", withinAuthority: true },
  { id: "ap-4", type: "purchase", description: "SC-0788 · Análises laboratoriais Q3", requester: "G. Kiefer", costCenter: "210", amount: 156_000, waitingDays: 2, slaStatus: "ok", withinAuthority: true },
  { id: "ap-5", type: "capex", description: "CAPEX · Ampliação pátio de estocagem", requester: "A. Pimenta", costCenter: "500", amount: 2_400_000, waitingDays: 6, slaStatus: "warning", withinAuthority: false },
  { id: "ap-6", type: "document", description: "Renovação · Apólice all-risk planta", requester: "Anielly S.", costCenter: "100", amount: 310_000, waitingDays: 1, slaStatus: "ok", withinAuthority: true },
  { id: "ap-7", type: "purchase", description: "SC-0790 · Combustível frota — jul/26", requester: "P. Lopes", costCenter: "410", amount: 420_000, waitingDays: 1, slaStatus: "ok", withinAuthority: true },
];
