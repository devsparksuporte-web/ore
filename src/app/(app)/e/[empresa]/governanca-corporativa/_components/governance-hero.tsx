"use client";

/**
 * ESTRUTURA DE GOVERNANÇA (HERO) — organograma executivo: uma caixa por pessoa
 * confirmada (nome em destaque, cargo abaixo), da presidência para baixo.
 * Órgãos cujos membros ainda não foram confirmados NÃO são exibidos — a
 * estrutura cresce conforme os nomes chegam, sem mostrar placeholder.
 * Responde "quem governa e quem decide?". Reusa <OrgFlow/>.
 */
import { Card, CardContent, CardHeader, CardTitle, EmptyState, OrgFlow, type OrgFlowNode } from "@/components/ui";
import type { GovernanceBody } from "@modules/corporate-governance";

/** Placeholder do dado: membro sem nome confirmado não entra no organograma. */
const UNCONFIRMED = "a confirmar";
const isConfirmed = (name: string) => name.trim().toLowerCase() !== UNCONFIRMED;

/** Ordem hierárquica de leitura: executiva → conselho → comitês. */
const ORDER: GovernanceBody["kind"][] = ["executive", "board", "committee"];

export function GovernanceHero({ bodies }: { bodies: GovernanceBody[] }) {
  const nodes: OrgFlowNode[] = [];

  for (const kind of ORDER) {
    for (const body of bodies.filter((b) => b.kind === kind)) {
      for (const m of body.members.filter((x) => isConfirmed(x.name))) {
        nodes.push({
          value: m.name,
          label: m.role,
          hint: m.mandate ? `Mandato ${m.mandate}` : undefined,
          emphasis: m.isPresident === true,
        });
      }
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Estrutura de governança</CardTitle></CardHeader>
      <CardContent>
        {nodes.length > 0 ? (
          <OrgFlow nodes={nodes} />
        ) : (
          <EmptyState
            kind="not-configured"
            title="Estrutura não informada"
            description="Os membros dos órgãos de governança ainda não foram confirmados."
          />
        )}
      </CardContent>
    </Card>
  );
}
