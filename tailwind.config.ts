import type { Config } from "tailwindcss";

/**
 * Tailwind ← Strata tokens (Sprint 1.1).
 * Fonte da verdade dos VALORES: src/app/globals.css (CSS variables).
 * Este arquivo apenas NOMEIA utilitários sobre as variáveis — nenhum
 * valor visual novo nasce aqui.
 */
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Triplets rgb(var … / <alpha>) — tema (claro/escuro) resolve no CSS,
           e modificadores /70 etc. funcionam (dark mode com opacidade). */
        gray: {
          50: "rgb(var(--rgb-gray-50) / <alpha-value>)",
          100: "rgb(var(--rgb-gray-100) / <alpha-value>)",
          200: "rgb(var(--rgb-gray-200) / <alpha-value>)",
          300: "rgb(var(--rgb-gray-300) / <alpha-value>)",
          400: "rgb(var(--rgb-gray-400) / <alpha-value>)",
          500: "rgb(var(--rgb-gray-500) / <alpha-value>)",
          700: "rgb(var(--rgb-gray-700) / <alpha-value>)",
          800: "rgb(var(--rgb-gray-800) / <alpha-value>)",
          900: "rgb(var(--rgb-gray-900) / <alpha-value>)",
        },
        navy: {
          50: "rgb(var(--rgb-navy-50) / <alpha-value>)",
          100: "rgb(var(--rgb-navy-100) / <alpha-value>)",
          700: "rgb(var(--rgb-navy-700) / <alpha-value>)",
          800: "rgb(var(--rgb-navy-800) / <alpha-value>)",
          900: "rgb(var(--rgb-navy-900) / <alpha-value>)",
          950: "rgb(var(--rgb-navy-950) / <alpha-value>)",
        },
        action: {
          100: "rgb(var(--rgb-action-100) / <alpha-value>)",
          600: "rgb(var(--rgb-action-600) / <alpha-value>)",
          700: "rgb(var(--rgb-action-700) / <alpha-value>)",
        },
        copper: {
          100: "rgb(var(--rgb-copper-100) / <alpha-value>)",
          500: "rgb(var(--rgb-copper-500) / <alpha-value>)",
        },
        success: {
          DEFAULT: "rgb(var(--rgb-success) / <alpha-value>)",
          bg: "rgb(var(--rgb-success-bg) / <alpha-value>)",
          fg: "rgb(var(--rgb-success-fg) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--rgb-warning) / <alpha-value>)",
          bg: "rgb(var(--rgb-warning-bg) / <alpha-value>)",
          fg: "rgb(var(--rgb-warning-fg) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "rgb(var(--rgb-danger) / <alpha-value>)",
          bg: "rgb(var(--rgb-danger-bg) / <alpha-value>)",
          fg: "rgb(var(--rgb-danger-fg) / <alpha-value>)",
        },
        info: {
          DEFAULT: "rgb(var(--rgb-info) / <alpha-value>)",
          bg: "rgb(var(--rgb-info-bg) / <alpha-value>)",
          fg: "rgb(var(--rgb-info-fg) / <alpha-value>)",
        },
        canvas: "var(--bg-canvas)",
        surface: "var(--bg-surface)",
        sunken: "var(--bg-sunken)",
        inverse: "rgb(var(--rgb-inverse) / <alpha-value>)",
        scrim: "rgb(8 21 39 / var(--opacity-overlay))",
        // shadcn semantic mapping (Radix)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
      },
      fontFamily: {
        display: ["var(--font-display)", "Inter Tight", "Inter", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      /* Escala consistente: pesos contidos (máx. 600), tracking padronizado
         (negativo em títulos/KPIs, positivo em labels), line-height por token */
      fontSize: {
        display: ["var(--text-display)", { lineHeight: "var(--leading-display)", fontWeight: "var(--font-semibold)", letterSpacing: "var(--tracking-display)" }],
        h1: ["var(--text-h1)", { lineHeight: "var(--leading-h1)", fontWeight: "var(--font-semibold)", letterSpacing: "var(--tracking-display)" }],
        h2: ["var(--text-h2)", { lineHeight: "var(--leading-h2)", fontWeight: "var(--font-semibold)", letterSpacing: "-0.01em" }],
        h3: ["var(--text-h3)", { lineHeight: "var(--leading-h3)", fontWeight: "var(--font-medium)" }],
        body: ["var(--text-body)", { lineHeight: "var(--leading-body)" }],
        "body-sm": ["var(--text-body-sm)", { lineHeight: "var(--leading-body-sm)" }],
        label: ["var(--text-label)", { lineHeight: "var(--leading-label)", letterSpacing: "var(--tracking-label)", fontWeight: "var(--font-medium)" }],
        caption: ["var(--text-caption)", { lineHeight: "var(--leading-caption)" }],
        kpi: ["var(--text-kpi)", { lineHeight: "var(--leading-kpi)", fontWeight: "var(--font-semibold)", letterSpacing: "var(--tracking-kpi)" }],
        micro: ["var(--text-micro)", { lineHeight: "var(--leading-micro)" }],
        hero: ["var(--text-hero)", { lineHeight: "var(--leading-hero)", fontWeight: "var(--font-medium)", letterSpacing: "var(--tracking-display)" }],
      },
      letterSpacing: {
        display: "var(--tracking-display)",
        kpi: "var(--tracking-kpi)",
        snug: "var(--tracking-snug)",
        label: "var(--tracking-label)",
        wide: "var(--tracking-wide)",
        caps: "var(--tracking-caps)",
        overline: "var(--tracking-overline)",
        banner: "var(--tracking-banner)",
        brand: "var(--tracking-brand)",
      },
      blur: {
        xs: "var(--blur-xs)",
        sm: "var(--blur-sm)",
        md: "var(--blur-md)",
        lg: "var(--blur-lg)",
        xl: "var(--blur-xl)",
      },
      backdropBlur: {
        xs: "var(--blur-xs)",
        sm: "var(--blur-sm)",
        md: "var(--blur-md)",
        lg: "var(--blur-lg)",
        xl: "var(--blur-xl)",
      },
      spacing: {
        "icon-xs": "var(--icon-xs)",
        "icon-sm": "var(--icon-sm)",
        "icon-md": "var(--icon-md)",
        "icon-lg": "var(--icon-lg)",
        "icon-xl": "var(--icon-xl)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        overlay: "var(--shadow-overlay)",
      },
      zIndex: {
        sticky: "var(--z-sticky)",
        topbar: "var(--z-topbar)",
        sidebar: "var(--z-sidebar)",
        overlay: "var(--z-overlay)",
        popover: "var(--z-popover)",
        toast: "var(--z-toast)",
      },
      opacity: {
        disabled: "var(--opacity-disabled)",
        overlay: "var(--opacity-overlay)",
        refetch: "var(--opacity-refetch)",
      },
      transitionDuration: {
        instant: "var(--duration-instant)",
        fast: "var(--duration-fast)",
        base: "var(--duration-base)",
        slow: "var(--duration-slow)",
      },
      transitionTimingFunction: {
        standard: "var(--ease-standard)",
        out: "var(--ease-out)",
      },
      maxWidth: { content: "1440px" },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
      animation: { "fade-in": "fade-in var(--duration-fast) var(--ease-out)" },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
