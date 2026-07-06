/**
 * @modules/api — PORT do cliente HTTP (adaptador real chega na E5).
 *
 * Contrato: quando a API NestJS existir, cada `modules/<x>/services`
 * troca o adaptador mock por chamadas via este cliente, mantendo as
 * assinaturas (sync → Promise + hooks TanStack Query por módulo,
 * doc 03 §9). Consumidores de barrels não mudam.
 */

export interface ApiClientConfig {
  baseUrl: string;
  getAccessToken: () => string | null;
}

export interface ApiError {
  code: string;        // estável — o front trata por código (doc 08 §6)
  status: number;
  title: string;
  detail?: string;
  requestId?: string;
}

export interface ApiClient {
  get<T>(path: string, params?: Record<string, unknown>): Promise<T>;
  post<T>(path: string, body?: unknown, opts?: { idempotencyKey?: string }): Promise<T>;
  patch<T>(path: string, body?: unknown): Promise<T>;
}

/** Placeholder consciente — implementação na US-05.1 (E5). */
export function createApiClient(_config: ApiClientConfig): ApiClient {
  throw new Error(
    "ApiClient será implementado na E5 (US-05.1). Módulos usam adaptadores mock até lá — ver modules/README.md."
  );
}
