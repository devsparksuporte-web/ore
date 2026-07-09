"use client";

/**
 * Bloco 2 · DECISÕES & AÇÕES — tabela moderna sobre o <DataTable/> do DS
 * (colunas declarativas, hover/clique nativos, export). Busca, filtros e
 * ordenação são estado de UI; os dados chegam já pelo port @modules/strategy.
 * Clique na linha abre o Drawer de detalhe (read-only, pronto para virar form).
 */
import * as React from "react";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import {
  Button, DataTable, Input, SectionHeader,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  type Column,
} from "@/components/ui";
import { isDecisionOverdue } from "@modules/strategy";
import type { AssetRef, Decision, DecisionStatus, Priority } from "@modules/strategy";
import { PriorityBadge, StatusBadge, TypeBadge } from "./decision-badges";
import { DecisionDrawer } from "./decision-drawer";

const ALL = "all";

type SortKey = "due" | "priority" | "asset" | "status" | "ref";
const priorityWeight: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
const statusWeight: Record<DecisionStatus, number> = {
  blocked: 0, in_progress: 1, open: 2, done: 3, canceled: 4,
};

export function DecisionsTable({
  decisions, assets, showAssetFilter = true,
}: {
  decisions: Decision[];
  assets: AssetRef[];
  showAssetFilter?: boolean;
}) {
  const [search, setSearch] = React.useState("");
  const [assetId, setAssetId] = React.useState(ALL);
  const [status, setStatus] = React.useState(ALL);
  const [priority, setPriority] = React.useState(ALL);
  const [type, setType] = React.useState(ALL);
  const [sortKey, setSortKey] = React.useState<SortKey>("due");
  const [asc, setAsc] = React.useState(true);

  const [selected, setSelected] = React.useState<Decision | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const rows = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = decisions.filter((d) => {
      if (showAssetFilter && assetId !== ALL && d.asset.id !== assetId) return false;
      if (status !== ALL && d.status !== status) return false;
      if (priority !== ALL && d.priority !== priority) return false;
      if (type !== ALL && d.type !== type) return false;
      if (term && !`${d.title} ${d.context} ${d.owner} ${d.asset.label}`.toLowerCase().includes(term)) return false;
      return true;
    });
    const dir = asc ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case "due": return ((a.dueDateISO ?? "9999") > (b.dueDateISO ?? "9999") ? 1 : -1) * dir;
        case "priority": return (priorityWeight[a.priority] - priorityWeight[b.priority]) * dir;
        case "asset": return a.asset.label.localeCompare(b.asset.label) * dir;
        case "status": return (statusWeight[a.status] - statusWeight[b.status]) * dir;
        case "ref": return (a.ref - b.ref) * dir;
      }
    });
  }, [decisions, search, assetId, status, priority, type, sortKey, asc, showAssetFilter]);

  const openRow = (d: Decision) => { setSelected(d); setDrawerOpen(true); };

  const columns: Column<Decision>[] = [
    { key: "asset", header: "Ativo", render: (d) => <span className="whitespace-nowrap font-medium text-gray-800">{d.asset.label}</span> },
    { key: "title", header: "Decisão / Ação", render: (d) => <span className="block max-w-[240px] truncate text-gray-900" title={d.title}>{d.title}</span> },
    { key: "context", header: "Contexto", render: (d) => <span className="block max-w-[260px] truncate text-gray-500" title={d.context}>{d.context}</span> },
    { key: "type", header: "Tipo", render: (d) => <TypeBadge type={d.type} /> },
    { key: "priority", header: "Prioridade", render: (d) => <PriorityBadge priority={d.priority} /> },
    { key: "owner", header: "Responsável", render: (d) => <span className="whitespace-nowrap text-gray-700">{d.owner}</span> },
    { key: "due", header: "Data limite", render: (d) => <span className={`whitespace-nowrap tnum ${isDecisionOverdue(d) ? "font-medium text-danger" : "text-gray-700"}`}>{d.dueDate}</span> },
    { key: "status", header: "Status", render: (d) => <StatusBadge status={d.status} /> },
    { key: "update", header: "Atualização", render: (d) => <span className="whitespace-nowrap text-gray-500">{d.lastUpdate}</span> },
  ];

  return (
    <section className="space-y-4">
      <SectionHeader title="Decisões & Ações" subtitle={`${rows.length} de ${decisions.length} registros`} />

      {/* Toolbar: busca + filtros + ordenação */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por decisão, contexto, responsável…"
            className="pl-9"
            aria-label="Buscar decisões"
          />
        </div>

        {showAssetFilter && (
          <FilterSelect value={assetId} onValueChange={setAssetId} label="Ativo" width="w-[168px]"
            options={[{ value: ALL, label: "Todos os ativos" }, ...assets.map((a) => ({ value: a.id, label: a.label }))]} />
        )}
        <FilterSelect value={status} onValueChange={setStatus} label="Status" width="w-[150px]"
          options={[{ value: ALL, label: "Todos os status" }, { value: "open", label: "Aberto" }, { value: "in_progress", label: "Em andamento" }, { value: "done", label: "Concluído" }, { value: "blocked", label: "Bloqueado" }, { value: "canceled", label: "Cancelado" }]} />
        <FilterSelect value={priority} onValueChange={setPriority} label="Prioridade" width="w-[144px]"
          options={[{ value: ALL, label: "Toda prioridade" }, { value: "high", label: "Alta" }, { value: "medium", label: "Média" }, { value: "low", label: "Baixa" }]} />
        <FilterSelect value={type} onValueChange={setType} label="Tipo" width="w-[132px]"
          options={[{ value: ALL, label: "Todos os tipos" }, { value: "decision", label: "Decisão" }, { value: "action", label: "Ação" }]} />

        <div className="ml-auto flex items-center gap-2">
          <FilterSelect value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)} label="Ordenar" width="w-[168px]"
            options={[{ value: "due", label: "Data limite" }, { value: "priority", label: "Prioridade" }, { value: "asset", label: "Ativo" }, { value: "status", label: "Status" }, { value: "ref", label: "Nº de origem" }]} />
          <Button variant="outline" size="icon" onClick={() => setAsc((v) => !v)} aria-label={asc ? "Ordem crescente" : "Ordem decrescente"} title={asc ? "Crescente" : "Decrescente"}>
            {asc ? <ArrowUp /> : <ArrowDown />}
          </Button>
        </div>
      </div>

      <DataTable columns={columns} rows={rows} onRowClick={openRow} dense />

      <DecisionDrawer decision={selected} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </section>
  );
}

function FilterSelect({
  value, onValueChange, label, options, width,
}: {
  value: string;
  onValueChange: (v: string) => void;
  label: string;
  options: { value: string; label: string }[];
  width: string;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={width} aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
