"use client";

import * as React from "react";
import { strokeWidths } from "@/components/charts/chart-tokens";

/**
 * Sparkline v2 — SVG puro, 32px, sem eixos (DS §7.3).
 * Curva suavizada (Catmull-Rom → Bézier) + área com gradiente discreto,
 * consistente com a linguagem dos gráficos grandes. Decorativa (aria-hidden);
 * o valor textual ao lado carrega a informação (13-a11y §6).
 */
export function Sparkline({
  data,
  className,
  stroke = "var(--chart-actual)",
}: {
  data: number[];
  className?: string;
  stroke?: string;
}) {
  const id = React.useId();
  if (!data.length) return null;

  const w = 96;
  const h = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - 4 - ((v - min) / range) * (h - 8),
  }));

  // Catmull-Rom → cubic Bézier (linha suave sem overshoot exagerado)
  const d = pts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x},${p.y}`;
    const p0 = pts[i - 2] ?? pts[i - 1];
    const p1 = pts[i - 1];
    const p2 = p;
    const p3 = pts[i + 1] ?? p;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    return `${acc} C ${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
  }, "");

  const area = `${d} L ${w},${h} L 0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.12} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={d} fill="none" stroke={stroke} strokeWidth={strokeWidths.context} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="2" fill={stroke} />
    </svg>
  );
}
