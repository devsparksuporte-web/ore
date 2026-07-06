/** @modules/settings — integrações e de-para (M07/M09). */
import { accountMappings, connections, MAPPING_PROGRESS, syncRuns } from "@/mocks/plataforma";
import type { AccountMapping, Connection, SyncRun } from "@/types/domain";

export type { AccountMapping, Connection, SyncRun };

export const listConnections = (): Connection[] => connections;
export const listSyncRuns = (): SyncRun[] => syncRuns;
export const listAccountMappings = (): AccountMapping[] => accountMappings;
export const getMappingProgress = () => MAPPING_PROGRESS;
