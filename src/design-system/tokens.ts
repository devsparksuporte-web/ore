/**
 * STRATA DESIGN TOKENS · espelho TypeScript (Sprint 04)
 * ─────────────────────────────────────────────────────
 * Fonte da verdade dos VALORES: src/app/globals.css (CSS variables).
 * Este módulo NÃO duplica valores visuais — expõe referências `var(--…)`
 * para consumo em JS/TS (inline styles, Recharts, canvas, animações) e
 * as poucas constantes numéricas que não podem ser CSS vars (strokeWidth
 * de SVG, durações em ms para timers).
 *
 * Regras:
 *  - Componentes React consomem tokens via utilitários Tailwind (preferido).
 *  - Consumo em JS usa SEMPRE este módulo. Nenhum valor mágico fora daqui.
 *  - Dataviz: cores de série ficam em @/lib/chart-tokens (espelho --chart-*).
 */

const v = (name: string) => `var(--${name})` as const;

/* ── Color · semânticos (tema resolve no CSS — nunca hardcode hex) ── */
export const color = {
  canvas: v("bg-canvas"),
  surface: v("bg-surface"),
  sunken: v("bg-sunken"),
  inverse: v("bg-inverse"),
  sidebarFrom: v("bg-sidebar-from"),
  sidebarTo: v("bg-sidebar-to"),
  border: "hsl(var(--border))",
  foreground: "hsl(var(--foreground))",
  mutedForeground: "hsl(var(--muted-foreground))",
  action: "rgb(var(--rgb-action-600))",
  copper: "rgb(var(--rgb-copper-500))",
  success: "rgb(var(--rgb-success))",
  warning: "rgb(var(--rgb-warning))",
  danger: "rgb(var(--rgb-danger))",
  info: "rgb(var(--rgb-info))",
} as const;

/* ── Spacing · grid 8px (passos aprovados; 4px só relações íntimas) ── */
export const space = {
  1: v("space-1"), // 4px
  2: v("space-2"), // 8px
  3: v("space-3"), // 12px
  4: v("space-4"), // 16px
  6: v("space-6"), // 24px
  8: v("space-8"), // 32px
  12: v("space-12"), // 48px
  16: v("space-16"), // 64px
} as const;

/* ── Radius ── */
export const radius = {
  sm: v("radius-sm"),
  base: v("radius"),
  md: v("radius-md"),
  lg: v("radius-lg"),
  full: v("radius-full"),
} as const;

/* ── Shadow ── */
export const shadow = {
  xs: v("shadow-xs"),
  sm: v("shadow-sm"),
  md: v("shadow-md"),
  lg: v("shadow-lg"),
  overlay: v("shadow-overlay"),
} as const;

/* ── Elevation · contrato de profundidade (nível → sombra + z quando flutua) ── */
export const elevation = {
  /** 0 · flat: divisórias/hairline, sem sombra */
  flat: { shadow: "none", z: v("z-base") },
  /** 1 · repouso: cards assentados */
  resting: { shadow: shadow.xs, z: v("z-base") },
  /** 2 · raised: hover/micro-elevação */
  raised: { shadow: shadow.md, z: v("z-base") },
  /** 3 · flutuante: popover/dropdown/tooltip */
  floating: { shadow: shadow.lg, z: v("z-popover") },
  /** 4 · overlay: dialog/drawer */
  overlay: { shadow: shadow.overlay, z: v("z-overlay") },
} as const;

/* ── Blur ── */
export const blur = {
  xs: v("blur-xs"),
  sm: v("blur-sm"),
  md: v("blur-md"),
  lg: v("blur-lg"),
  xl: v("blur-xl"),
} as const;

/* ── Typography · escala (consumir via classes text-* do Tailwind) ── */
export const typography = {
  display: { size: v("text-display"), leading: v("leading-display"), tracking: v("tracking-display"), weight: 600 },
  h1: { size: v("text-h1"), leading: v("leading-h1"), tracking: v("tracking-display"), weight: 600 },
  h2: { size: v("text-h2"), leading: v("leading-h2"), tracking: v("tracking-snug"), weight: 600 },
  h3: { size: v("text-h3"), leading: v("leading-h3"), tracking: "0", weight: 500 },
  body: { size: v("text-body"), leading: v("leading-body"), tracking: "0", weight: 400 },
  bodySm: { size: v("text-body-sm"), leading: v("leading-body-sm"), tracking: "0", weight: 400 },
  label: { size: v("text-label"), leading: v("leading-label"), tracking: v("tracking-label"), weight: 500 },
  caption: { size: v("text-caption"), leading: v("leading-caption"), tracking: "0", weight: 400 },
  kpi: { size: v("text-kpi"), leading: v("leading-kpi"), tracking: v("tracking-kpi"), weight: 600 },
  micro: { size: v("text-micro"), leading: v("leading-micro"), tracking: v("tracking-overline"), weight: 500 },
} as const;

/* ── Icon sizing · Lucide (classes: h-icon-md w-icon-md) ──
   strokeWidth é atributo SVG numérico — única constante fora do CSS. */
export const icon = {
  size: { xs: v("icon-xs"), sm: v("icon-sm"), md: v("icon-md"), lg: v("icon-lg"), xl: v("icon-xl") },
  stroke: { light: 1.25, regular: 1.6, bold: 2 },
} as const;

/* ── Motion · durações numéricas p/ timers e libs JS (= CSS vars) ── */
export const motion = {
  duration: { instant: 120, fast: 150, base: 200, slow: 220 },
  cssDuration: {
    instant: v("duration-instant"),
    fast: v("duration-fast"),
    base: v("duration-base"),
    slow: v("duration-slow"),
  },
  ease: { standard: "cubic-bezier(0.2, 0, 0, 1)", out: "cubic-bezier(0, 0, 0.2, 1)" },
} as const;

/* ── Z-index ── */
export const zIndex = {
  base: v("z-base"),
  sticky: v("z-sticky"),
  topbar: v("z-topbar"),
  sidebar: v("z-sidebar"),
  overlay: v("z-overlay"),
  popover: v("z-popover"),
  toast: v("z-toast"),
} as const;

/* ── Opacity ── */
export const opacity = {
  disabled: v("opacity-disabled"),
  overlay: v("opacity-overlay"),
  refetch: v("opacity-refetch"),
  mutedIcon: v("opacity-muted-icon"),
} as const;

export const tokens = { color, space, radius, shadow, elevation, blur, typography, icon, motion, zIndex, opacity } as const;
export type DesignTokens = typeof tokens;
