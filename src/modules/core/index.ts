/**
 * @core — shared kernel do front-end (M00).
 * Interface pública: design system Strata + utilitários puros + tipos base.
 * REGRA: core não importa de nenhum módulo de domínio.
 */

// Design system (primitivos Strata)
export * from "@/components/ui/button";
export * from "@/components/ui/card";
export * from "@/components/ui/badge";
export * from "@/components/ui/input";
export * from "@/components/ui/tabs";
export * from "@/components/ui/sheet";
export * from "@/components/ui/dialog";
export * from "@/components/ui/table";
export * from "@/components/ui/select";
export * from "@/components/ui/tooltip";
export * from "@/components/ui/dropdown-menu";
export * from "@/components/ui/skeleton";

// Utilitários puros
export { cn } from "@/lib/utils";
export { formatMoney, formatAccounting, formatPct, formatDate, relativeTime } from "@/lib/format";
