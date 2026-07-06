/**
 * Registry de datasets do Analytics Engine.
 * Datasets são registrados pelo composition root da aplicação —
 * o engine não conhece domínios (mesma inversão do Widget Engine).
 */
import type { AnalyticsQuery, AnalyticsResult, DatasetResolver } from "./types";

const datasets = new Map<string, DatasetResolver>();

export function registerDataset(name: string, resolver: DatasetResolver) {
  if (datasets.has(name) && process.env.NODE_ENV !== "production") {
    console.warn(`[analytics-engine] sobrescrevendo dataset "${name}"`);
  }
  datasets.set(name, resolver);
}

export function resolveQuery(query: AnalyticsQuery): AnalyticsResult {
  const resolver = datasets.get(query.dataset);
  if (!resolver) {
    return { kind: "empty", message: `Dataset "${query.dataset}" não registrado` };
  }
  try {
    return resolver(query);
  } catch {
    return { kind: "empty", message: "Falha ao resolver a consulta" };
  }
}

export function listDatasets(): string[] {
  return Array.from(datasets.keys()).sort();
}
