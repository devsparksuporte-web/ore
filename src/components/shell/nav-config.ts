import {
  BarChart3, Briefcase, Building2, FileCheck2, FolderKanban, GitBranch, LayoutDashboard,
  Link2, ListChecks, Landmark, Receipt, ScrollText, Settings, ShieldCheck, TrendingUp,
  Users, Wallet, type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  disabled?: boolean;
  disabledReason?: string;
}
export interface NavGroup {
  label: string;
  items: NavItem[];
}

/** Menu do contexto Portfólio (doc 03 §1). */
export const portfolioNav: NavGroup[] = [
  {
    label: "Visão Geral",
    items: [
      { label: "Dashboard", href: "/portfolio/overview", icon: LayoutDashboard },
      { label: "Visão Financeira (configurável)", href: "/dashboards/visao-financeira-ativa", icon: BarChart3 },
    ],
  },
  {
    label: "Portfólio",
    items: [
      { label: "Investidas", href: "/portfolio/investidas", icon: Building2 },
      { label: "Pipeline", href: "/portfolio/pipeline", icon: FolderKanban, disabled: true, disabledReason: "Disponível na Fase 3" },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { label: "DRE Consolidada", href: "/portfolio/dre", icon: BarChart3, disabled: true, disabledReason: "Disponível com 2+ investidas integradas" },
      { label: "Caixa do Portfólio", href: "/portfolio/caixa", icon: Wallet, disabled: true, disabledReason: "Disponível com 2+ investidas integradas" },
    ],
  },
  {
    label: "Administração",
    items: [
      { label: "Usuários", href: "/admin/usuarios", icon: Users },
      { label: "Notificações", href: "/notificacoes", icon: ListChecks },
    ],
  },
];

/** Menu do contexto Empresa (doc 04 §1). */
export function companyNav(slug: string, pendingApprovals: number): NavGroup[] {
  const base = `/e/${slug}`;
  return [
    {
      label: "Visão Geral",
      items: [{ label: "Dashboard", href: `${base}/overview`, icon: LayoutDashboard }],
    },
    {
      label: "Financeiro",
      items: [
        { label: "Fluxo de Caixa", href: `${base}/financeiro/fluxo-de-caixa`, icon: Wallet },
        { label: "DRE", href: `${base}/financeiro/dre`, icon: BarChart3 },
        { label: "Balanço", href: `${base}/financeiro/balanco`, icon: Landmark, disabled: true, disabledReason: "Disponível na v1.1" },
        { label: "Orçado x Realizado", href: `${base}/financeiro/oxr`, icon: TrendingUp },
        { label: "Forecast", href: `${base}/financeiro/forecast`, icon: GitBranch, disabled: true, disabledReason: "Disponível na v1.1" },
      ],
    },
    {
      label: "Operações",
      items: [
        { label: "Compras", href: `${base}/operacoes/compras`, icon: Receipt, badge: pendingApprovals },
        { label: "CAPEX", href: `${base}/operacoes/capex`, icon: Briefcase, disabled: true, disabledReason: "Disponível na v1.1" },
      ],
    },
    {
      label: "Governança",
      items: [
        { label: "Aprovações", href: `${base}/governanca/aprovacoes`, icon: FileCheck2, badge: pendingApprovals },
        { label: "Auditoria", href: `${base}/governanca/auditoria`, icon: ShieldCheck },
        { label: "Documentos", href: `${base}/governanca/documentos`, icon: ScrollText, disabled: true, disabledReason: "Disponível na v1.1" },
      ],
    },
    {
      label: "Configurações",
      items: [
        { label: "Integrações", href: `${base}/config/integracoes`, icon: Link2 },
        { label: "De-Para de Contas", href: `${base}/config/de-para`, icon: GitBranch },
        { label: "Períodos", href: `${base}/config/periodos`, icon: Settings },
      ],
    },
  ];
}
