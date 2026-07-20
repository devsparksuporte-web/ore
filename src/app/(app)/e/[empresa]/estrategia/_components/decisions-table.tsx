"use client";

/**
 * DECISÕES & AÇÕES — índice executivo enxuto sobre o <DataTable/> do DS:
 * apenas o essencial (Decisão, Responsável, Prazo, Status). Convida a explorar —
 * o detalhe completo abre no Drawer ao clicar na linha. Busca, filtros e
 * ordenação (funcionalidade preservada) ficam numa toolbar discreta.
 */
import * as React from "react";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import {
  Button, Card, CardContent, CardHeader, CardTitle, DataTable, Input,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  type Column,
} from "@/components/ui";
import { isDecisionOverdue } from "@modules/strategy";
import type { AssetRef, Decision, DecisionStatus, Priority } from "@modules/strategy";
import { StatusBadge } from "./decision-badges";
import { DecisionDrawer } from "./decision-drawer";

const ALL = "all";

type SortKey = "due" | "priority" | "status" | "ref";
const priorityWeight: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
const statusWeight: Record<DecisionStatus, number> = {
  blocked: 0, in_progress: 1, open: 2, done: 3, canceled: 4,
};

export function DecisionsTable({
  decisions, assets, showAssetFilter = true, title = "Decisões e ações",
}: {
  decisions: Decision[];
  assets: AssetRef[];
  showAssetFilter?: boolean;
  title?: string;
}) {
  const [search, setSearch] = React.useState("");
  const [assetId, setAssetId] = React.useState(ALL);
  const [status, setStatus] = React.useState(ALL);
  const [priority, setPriority] = React.useState(ALL);
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
      if (term && !`${d.title} ${d.context} ${d.owner} ${d.asset.label}`.toLowerCase().includes(term)) return false;
      return true;
    });
    const dir = asc ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case "due": return ((a.dueDateISO ?? "9999") > (b.dueDateISO ?? "9999") ? 1 : -1) * dir;
        case "priority": return (priorityWeight[a.priority] - priorityWeight[b.priority]) * dir;
        case "status": return (statusWeight[a.status] - statusWeight[b.status]) * dir;
        case "ref": return (a.ref - b.ref) * dir;
      }
    });
  }, [decisions, search, assetId, status, priority, sortKey, asc, showAssetFilter]);

  const openRow = (d: Decision) => { setSelected(d); setDrawerOpen(true); };

  // Toolbar de busca/filtros/ordenação só aparece quando a lista é longa o
  // bastante para justificá-la (evita chrome desproporcional sobre poucas linhas).
  const showToolbar = decisions.length > 8;

  const columns: Column<Decision>[] = [
    ...(showAssetFilter
      ? [{ key: "asset", header: "Ativo", render: (d: Decision) => <span className="whitespace-nowrap text-gray-600">{d.asset.label}</span> }]
      : []),
    { key: "title", header: "Decisão", render: (d) => <span className="block max-w-[520px] truncate text-body-sm font-medium text-navy-900" title={d.title}>{d.title}</span> },
    { key: "owner", header: "Responsável", render: (d) => <span className="whitespace-nowrap text-body-sm text-gray-600">{d.owner}</span> },
    { key: "due", header: "Prazo", render: (d) => <span className={`whitespace-nowrap text-body-sm tnum ${isDecisionOverdue(d) ? "font-medium text-danger" : "text-gray-600"}`}>{d.dueDate}</span> },
    { key: "status", header: "Status", render: (d) => <StatusBadge status={d.status} /> },
  ];

  return (
    <Card className="anim-rise">
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="pt-1">
        {showToolbar && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar decisão, responsável ou contexto…"
            className="pl-9"
            aria-label="Buscar decisões"
          />
        </div>

        {showAssetFilter && (
          <FilterSelect value={assetId} onValueChange={setAssetId} label="Ativo" width="w-[150px]"
            options={[{ value: ALL, label: "Ativo" }, ...assets.map((a) => ({ value: a.id, label: a.label }))]} />
        )}
        <FilterSelect value={status} onValueChange={setStatus} label="Status" width="w-[144px]"
          options={[{ value: ALL, label: "Status" }, { value: "open", label: "Aberto" }, { value: "in_progress", label: "Em andamento" }, { value: "done", label: "Concluído" }, { value: "blocked", label: "Bloqueado" }, { value: "canceled", label: "Cancelado" }]} />
        <FilterSelect value={priority} onValueChange={setPriority} label="Prioridade" width="w-[140px]"
          options={[{ value: ALL, label: "Prioridade" }, { value: "high", label: "Alta" }, { value: "medium", label: "Média" }, { value: "low", label: "Baixa" }]} />

        <div className="ml-auto flex items-center gap-2">
          <FilterSelect value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)} label="Ordenar" width="w-[150px]"
            options={[{ value: "due", label: "Prazo" }, { value: "priority", label: "Prioridade" }, { value: "status", label: "Status" }, { value: "ref", label: "Nº de origem" }]} />
          <Button variant="outline" size="icon" onClick={() => setAsc((v) => !v)} aria-label={asc ? "Ordem crescente" : "Ordem decrescente"} title={asc ? "Crescente" : "Decrescente"}>
            {asc ? <ArrowUp /> : <ArrowDown />}
          </Button>
        </div>
      </div>
        )}

        <DataTable columns={columns} rows={rows} onRowClick={openRow} dense />
      </CardContent>

      <DecisionDrawer decision={selected} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </Card>
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
      <SelectTrigger className={`${width} whitespace-nowrap`} aria-label={label}>
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
