/**
 * Núcleo do Insight Engine: providers (port AI-ready) + runner de regras.
 */
import type { Insight, InsightContext, InsightProvider, InsightRule } from "./types";
import { defaultRules } from "./rules";

/** Adaptador v1 — regras determinísticas (auditáveis, sem I/O). */
export class RuleBasedInsightProvider implements InsightProvider {
  readonly name = "rules-v1";
  constructor(private rules: InsightRule[] = defaultRules) {}

  async generateInsights(ctx: InsightContext): Promise<Insight[]> {
    return this.rules
      .map((rule) => {
        try {
          return rule(ctx);
        } catch {
          return null; // regra defeituosa jamais derruba a análise
        }
      })
      .filter((i): i is Insight => i !== null)
      .sort((a, b) => b.priority - a.priority);
  }
}

/**
 * Adaptador de IA — placeholder consciente (P5 do roadmap).
 * Implementará a MESMA interface: o contexto tipado vira prompt estruturado,
 * a resposta é validada contra o schema de Insight (zod, packages/contracts)
 * e SEMPRE carrega evidence — insight sem evidência não é exibido (princípio
 * de confiança do produto aplicado também à IA).
 */
export function createAiInsightProvider(): InsightProvider {
  return {
    name: "ai-v0",
    async generateInsights() {
      throw new Error(
        "AiInsightProvider será implementado na P5 (inteligência assistida). Use RuleBasedInsightProvider."
      );
    },
  };
}

/** Executa o provider vigente com proteção total (análise nunca quebra a tela). */
export async function generateInsights(
  ctx: InsightContext,
  provider: InsightProvider = new RuleBasedInsightProvider()
): Promise<Insight[]> {
  try {
    return await provider.generateInsights(ctx);
  } catch {
    return [];
  }
}
