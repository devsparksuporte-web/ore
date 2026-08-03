"use client";

/**
 * ESTRUTURA DE GOVERNANÇA (HERO) — organograma executivo: uma caixa por pessoa
 * confirmada (nome em destaque, cargo abaixo), da presidência para baixo.
 * Órgãos cujos membros ainda não foram confirmados NÃO são exibidos — a
 * estrutura cresce conforme os nomes chegam, sem mostrar placeholder.
 * Responde "quem governa e quem decide?". Reusa <OrgFlow/>.
 */
import { EditorialSection, EmptyState, OrgFlow, type OrgFlowNode } from "@/components/ui";
import type { GovernanceBody } from "@modules/corporate-governance";

/** Placeholder do dado: membro sem nome confirmado não entra no organograma. */
const UNCONFIRMED = "a confirmar";
const isConfirmed = (name: string) => name.trim().toLowerCase() !== UNCONFIRMED;

/** Ordem hierárquica de leitura: executiva → conselho → comitês. */
const ORDER: GovernanceBody["kind"][] = ["executive", "board", "committee"];

export function GovernanceHero({ bodies }: { bodies: GovernanceBody[] }) {
  const nodes: OrgFlowNode[] = [];
  const seen = new Set<string>();

  for (const kind of ORDER) {
    for (const body of bodies.filter((b) => b.kind === kind)) {
      // Órgão só entra no organograma quando TODOS os seus membros estão
      // confirmados — evita exibir um colegiado pela metade.
      if (body.members.length === 0 || !body.members.every((m) => isConfirmed(m.name))) continue;
      for (const m of body.members) {
        // Uma pessoa aparece uma única vez (na posição mais alta em que atua).
        const key = m.name.trim().toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        nodes.push({ value: m.name, label: m.role, emphasis: m.isPresident === true });
      }
    }
  }

  return (
    <EditorialSection title="Estrutura de governança">
        {nodes.length > 0 ? (
          <OrgFlow nodes={nodes} />
        ) : (
          <EmptyState
            kind="not-configured"
            title="Estrutura não informada"
            description="Os membros dos órgãos de governança ainda não foram confirmados."
          />
        )}
    </EditorialSection>
  );
}
