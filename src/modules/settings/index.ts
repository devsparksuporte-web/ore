/**
 * @modules/settings — fontes de dados e de-para (M07/M09).
 *
 * Sprint 1.4 · item 3: `listSyncRuns` foi REMOVIDO junto com o mock de
 * execuções de sincronização. Não havia sincronização para registrar — o log
 * era ficção. `listConnections` foi preservado (nome e assinatura) porque é
 * consumido pela Home e pelo Analytics Engine; o que mudou é o significado:
 * agora devolve FONTES DE DADOS com proveniência, não conectores com saúde.
 */
import { accountMappings, connections, MAPPING_PROGRESS } from "@/mocks/plataforma";
import type { AccountMapping, Connection } from "@/types/domain";

export type { AccountMapping, Connection };

export const listConnections = (): Connection[] => connections;
export const listAccountMappings = (): AccountMapping[] => accountMappings;
export const getMappingProgress = () => MAPPING_PROGRESS;
