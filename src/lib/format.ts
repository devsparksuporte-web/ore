/** Formatação financeira pt-BR (DS §2, doc 10 T9 — exibição apenas). */

export function formatMoney(value: number, opts?: { compact?: boolean; currency?: string }) {
  const { compact = false, currency = "BRL" } = opts ?? {};
  if (compact) {
    const abs = Math.abs(value);
    const sign = value < 0 ? "-" : "";
    if (abs >= 1_000_000_000) return `${sign}R$ ${(abs / 1_000_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} bi`;
    if (abs >= 1_000_000) return `${sign}R$ ${(abs / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;
    if (abs >= 1_000) return `${sign}R$ ${(abs / 1_000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} mil`;
    return `${sign}R$ ${abs.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
  }
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
}

/** Convenção contábil: negativos entre parênteses (DS §1.5). */
export function formatAccounting(value: number) {
  const formatted = Math.abs(value).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return value < 0 ? `(${formatted})` : formatted;
}

export function formatPct(value: number, opts?: { signed?: boolean; digits?: number }) {
  const { signed = false, digits = 1 } = opts ?? {};
  const sign = signed && value > 0 ? "+" : "";
  return `${sign}${value.toLocaleString("pt-BR", { maximumFractionDigits: digits, minimumFractionDigits: digits })}%`;
}

export function formatDate(iso: string, style: "short" | "long" | "monthYear" = "short") {
  const d = new Date(iso + (iso.length === 10 ? "T12:00:00" : ""));
  if (style === "monthYear") return d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }).replace(".", "");
  if (style === "long") return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  return d.toLocaleDateString("pt-BR");
}

export function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${Math.max(mins, 1)} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "ontem";
  return `${days}d`;
}
