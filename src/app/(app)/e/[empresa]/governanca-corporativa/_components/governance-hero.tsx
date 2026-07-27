"use client";

/**
 * ESTRUTURA DE GOVERNANÇA (HERO) — organograma executivo vertical: presidência
 * → diretoria estatutária → conselho → comitês. Responde "quem governa e quem
 * decide?" com visão institucional (não uma lista de pessoas). Reusa <OrgFlow/>.
 */
import { Card, CardContent, CardHeader, CardTitle, OrgFlow, type OrgFlowNode } from "@/components/ui";
import type { GovernanceBody } from "@modules/corporate-governance";

export function GovernanceHero({ bodies }: { bodies: GovernanceBody[] }) {
  const exec = bodies.find((b) => b.kind === "executive");
  const board = bodies.find((b) => b.kind === "board");
  const committees = bodies.filter((b) => b.kind === "committee");
  const president = exec?.members.find((m) => m.isPresident) ?? exec?.members[0];

  const nodes: OrgFlowNode[] = [];
  if (president) nodes.push({ label: "Presidência executiva", value: president.name, hint: president.role, emphasis: true });
  if (exec) {
    const others = exec.members.filter((m) => !m.isPresident).map((m) => m.role);
    nodes.push({ label: exec.name, value: `${exec.members.length} membros`, hint: others.length ? others.join(" · ") : undefined });
  }
  if (board) {
    const mandate = board.members.find((m) => m.mandate)?.mandate;
    nodes.push({ label: board.name, value: `${board.members.length} membros`, hint: mandate ? `mandato ${mandate}` : undefined });
  }
  if (committees.length) {
    nodes.push({
      label: "Comitês",
      value: `${committees.length} ${committees.length === 1 ? "ativo" : "ativos"}`,
      hint: committees.map((c) => c.name.replace(/^Comit[êe] de /i, "")).join(" · "),
    });
  }

  return (
    <Card>
      <CardHeader><CardTitle>Estrutura de governança</CardTitle></CardHeader>
      <CardContent>
        <OrgFlow nodes={nodes} />
      </CardContent>
    </Card>
  );
}
