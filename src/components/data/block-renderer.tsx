"use client";

/**
 * RENDERIZADOR DE BLOCOS DE DASHBOARD.
 *
 * Um só renderizador para o dashboard das seis investidas e o do portfólio.
 * Por que genérico: a Sprint 1.4 fixou que nenhuma investida ganha componente
 * exclusivo — a Ativa não é arquitetura especial, e o que vale para ela vale
 * para as outras cinco. O que muda entre as telas é a COMPOSIÇÃO (quais
 * blocos existem), decidida no adaptador; a forma de desenhar é a mesma.
 *
 * Só componentes e tokens do Design System. Nenhuma cor nova.
 */
import * as React from "react";
import { EditorialSection } from "@/components/ui";
import { MetricStrip, type MetricItem } from "@/components/ui/metric-strip";
import { SourceCaption } from "@/components/data/source-caption";
import { SeriesChart } from "@/components/charts/series-chart";
import { Badge } from "@/components/ui/badge";
import type { BlocoDashboard } from "@modules/organizations";
import { cn } from "@/lib/utils";

/** Rótulo de origem legível — a UI nunca mostra caminho de arquivo cru. */
function fonteLegivel(fonte: { label: string; sheet?: string; cell?: string }): string {
  return fonte.label;
}

function Ressalva({ texto }: { texto: string }) {
  return <p className="mt-3 max-w-prose text-caption leading-6 text-warning-fg">{texto}</p>;
}

function Rodape({ bloco }: { bloco: BlocoDashboard }) {
  return (
    <div className="mt-4 border-t pt-2.5">
      <SourceCaption source={fonteLegivel(bloco.fonte)} dataStatus={bloco.dataStatus} />
    </div>
  );
}

/* ── Métricas ───────────────────────────────────────────────────────────── */

function BlocoMetricasView({ bloco }: { bloco: Extract<BlocoDashboard, { tipo: "metricas" }> }) {
  const itens: MetricItem[] = bloco.itens.map((i) => ({
    label: i.rotulo,
    value: i.valor,
    hint: i.nota,
    muted: i.ausente,
  }));
  return (
    <EditorialSection title={bloco.titulo} meta={bloco.descricao}>
      <MetricStrip items={itens} className="border-t-0 pt-0" />
      {bloco.ressalva && <Ressalva texto={bloco.ressalva} />}
      <Rodape bloco={bloco} />
    </EditorialSection>
  );
}

/* ── Ficha ──────────────────────────────────────────────────────────────── */

function BlocoFichaView({ bloco }: { bloco: Extract<BlocoDashboard, { tipo: "ficha" }> }) {
  return (
    <EditorialSection title={bloco.titulo} meta={bloco.descricao}>
      <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
        {bloco.linhas.map((l) => (
          <div key={l.rotulo} className="border-b pb-2.5">
            <dt className="text-caption text-gray-500">{l.rotulo}</dt>
            <dd className="mt-1 text-body-sm leading-6 text-navy-900">{l.valor}</dd>
          </div>
        ))}
      </dl>
      {bloco.ressalva && <Ressalva texto={bloco.ressalva} />}
      <Rodape bloco={bloco} />
    </EditorialSection>
  );
}

/* ── Tabela ─────────────────────────────────────────────────────────────── */

const alinhamento = { left: "text-left", right: "text-right", center: "text-center" } as const;

function BlocoTabelaView({ bloco }: { bloco: Extract<BlocoDashboard, { tipo: "tabela" }> }) {
  const destaque = new Set(bloco.destaque ?? []);
  return (
    <EditorialSection title={bloco.titulo} meta={bloco.descricao}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-body-sm">
          <thead>
            <tr className="border-b text-caption text-gray-500">
              {bloco.colunas.map((c) => (
                <th
                  key={c.rotulo}
                  className={cn("pb-2 pr-6 font-normal last:pr-0", alinhamento[c.alinhamento ?? "left"])}
                >
                  {c.rotulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bloco.linhas.map((linha, i) => (
              <tr key={i} className={cn("border-b last:border-b-0", destaque.has(i) && "font-medium")}>
                {linha.map((celula, j) => (
                  <td
                    key={j}
                    className={cn(
                      "py-2.5 pr-6 tnum last:pr-0",
                      alinhamento[bloco.colunas[j]?.alinhamento ?? "left"],
                      j === 0 ? "text-navy-900" : "text-gray-700",
                      /* Célula sem valor na fonte: cinza claro, nunca zero. */
                      celula === null && "text-gray-400"
                    )}
                  >
                    {celula ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {bloco.ressalva && <Ressalva texto={bloco.ressalva} />}
      <Rodape bloco={bloco} />
    </EditorialSection>
  );
}

/* ── Série ──────────────────────────────────────────────────────────────── */

function BlocoSerieView({ bloco }: { bloco: Extract<BlocoDashboard, { tipo: "serie" }> }) {
  const serieUnica = bloco.pontos.every((p) => p.b === undefined);

  return (
    <EditorialSection title={bloco.titulo} meta={bloco.descricao}>
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-navy-900" aria-hidden /> {bloco.legendaA}
        </span>
        {!serieUnica && bloco.legendaB && (
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-gray-300" aria-hidden /> {bloco.legendaB}
          </span>
        )}
        <span className="tnum">{bloco.unidade}</span>
      </div>
      <SeriesChart
        pontos={bloco.pontos}
        forma={bloco.forma}
        legendaA={bloco.legendaA}
        legendaB={bloco.legendaB}
        unidade={bloco.unidade}
      />
      {bloco.ressalva && <Ressalva texto={bloco.ressalva} />}
      <Rodape bloco={bloco} />
    </EditorialSection>
  );
}

/* ── Marcos ─────────────────────────────────────────────────────────────── */

const tomStatus: Record<string, string> = {
  "Concluído": "text-success-fg",
  "Em andamento": "text-navy-900",
  "Agendado": "text-navy-900",
  "Em avaliação": "text-gray-600",
  "Aberto": "text-gray-500",
  "Bloqueado": "text-danger",
};

function BlocoMarcosView({ bloco }: { bloco: Extract<BlocoDashboard, { tipo: "marcos" }> }) {
  return (
    <EditorialSection title={bloco.titulo} meta={bloco.descricao}>
      <ul className="divide-y">
        {bloco.itens.map((m) => (
          <li key={m.titulo} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3">
            <span className="min-w-0 flex-1">
              <span className="block text-body-sm font-medium leading-6 text-navy-900">{m.titulo}</span>
              <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-caption text-gray-500">
                {m.categoria && <Badge variant="navy">{m.categoria}</Badge>}
                {m.responsavel && <span>{m.responsavel}</span>}
                {m.alvo && <span className="tnum">{m.alvo}</span>}
                {m.notas && <span className="text-gray-400">{m.notas}</span>}
              </span>
            </span>
            {m.status && (
              <span className={cn("shrink-0 text-caption", tomStatus[m.status] ?? "text-gray-500")}>
                {m.status}
              </span>
            )}
          </li>
        ))}
      </ul>
      {bloco.ressalva && <Ressalva texto={bloco.ressalva} />}
      <Rodape bloco={bloco} />
    </EditorialSection>
  );
}

/* ── Notas ──────────────────────────────────────────────────────────────── */

function BlocoNotasView({ bloco }: { bloco: Extract<BlocoDashboard, { tipo: "notas" }> }) {
  return (
    <EditorialSection title={bloco.titulo} meta={bloco.descricao}>
      <dl className="space-y-3">
        {bloco.itens.map((n, i) => (
          <div key={`${n.rotulo}-${i}`} className="border-b pb-3 last:border-b-0">
            {n.rotulo && <dt className="text-caption font-medium text-navy-900">{n.rotulo}</dt>}
            <dd className="mt-0.5 max-w-prose text-body-sm leading-6 text-gray-700">{n.texto}</dd>
          </div>
        ))}
      </dl>
      {bloco.ressalva && <Ressalva texto={bloco.ressalva} />}
      <Rodape bloco={bloco} />
    </EditorialSection>
  );
}

/* ── Despacho ───────────────────────────────────────────────────────────── */

export function BlockRenderer({ blocos }: { blocos: BlocoDashboard[] }) {
  return (
    <>
      {blocos.map((b) => {
        switch (b.tipo) {
          case "metricas": return <BlocoMetricasView key={b.id} bloco={b} />;
          case "ficha": return <BlocoFichaView key={b.id} bloco={b} />;
          case "tabela": return <BlocoTabelaView key={b.id} bloco={b} />;
          case "serie": return <BlocoSerieView key={b.id} bloco={b} />;
          case "marcos": return <BlocoMarcosView key={b.id} bloco={b} />;
          case "notas": return <BlocoNotasView key={b.id} bloco={b} />;
        }
      })}
    </>
  );
}
