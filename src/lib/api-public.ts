import { fetchApiJson } from '@/lib/api-core';
import type { FetchApiJsonOptions } from '@/lib/api-core';
import { logger } from '@/lib/logger';

type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type ApiPublicRequestInit = Omit<FetchApiJsonOptions, 'credentials'>;

/**
 * Public API call. Omits cookies and disables session recovery.
 * Next.js cache behavior is configured explicitly at each server call site.
 * Safe for server loaders and other modules that must not pull session recovery.
 */
export async function apiPublicRequest<TResponse = unknown, TBody = unknown>(
  endpointOrUrl: string,
  method: HttpMethod,
  data?: TBody,
  init?: ApiPublicRequestInit,
): Promise<TResponse> {
  try {
    const headers = new Headers(init?.headers);
    return await fetchApiJson<TResponse>(endpointOrUrl, method, data, {
      ...init,
      headers,
      credentials: 'omit',
    });
  } catch (e) {
    logger.errorFromUnknown('api_public_request_failed', e, { endpointOrUrl, method });
    throw e;
  }
}
