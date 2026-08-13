/**
 * @modules/data-source — porta pública do estado e da proveniência do dado.
 *
 * Conceito do produto Crystal, agnóstico de cliente e de fonte. Adaptadores
 * (hoje o workbook da ORE; amanhã OneDrive, API ou data warehouse) preenchem
 * estes contratos; a UI apenas lê.
 *
 * Nada de ingestão vive aqui — nem descoberta de arquivo, nem autenticação,
 * nem sincronização. Este módulo descreve o que se sabe sobre um dado.
 */
export type { DataStatus, Fornecido, ModuleAvailability, SourceRef } from "./types";
export { DATA_STATUS_LABEL, MODULE_AVAILABILITY_LABEL, ORIGEM_INDEFINIDA } from "./types";
