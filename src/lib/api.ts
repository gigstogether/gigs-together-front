import type { FetchApiJsonOptions } from '@/lib/api-core';
import { fetchApiJsonWithSessionRecovery } from '@/lib/api-session-recovery';
import { logger } from '@/lib/logger';

export { apiPublicRequest } from '@/lib/api-public';
export {
  ApiError,
  TELEGRAM_INIT_DATA_EXPIRED_CODE,
  isTelegramInitDataExpiredError,
} from '@/lib/api-errors';

type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

type ApiRequestInit = Omit<FetchApiJsonOptions, 'credentials'>;

/**
 * Session API call with cookie auth and transport-level session recovery.
 * Does not trigger client sign-in UI; use {@link apiClientRequest} in browser code.
 */
export async function apiRequest<TResponse = unknown, TBody = unknown>(
  endpointOrUrl: string,
  method: HttpMethod,
  data?: TBody,
  init?: ApiRequestInit,
): Promise<TResponse> {
  try {
    const headers = new Headers(init?.headers);
    return await fetchApiJsonWithSessionRecovery<TResponse>(endpointOrUrl, method, data, {
      init: {
        ...init,
        headers,
      },
    });
  } catch (e) {
    logger.errorFromUnknown('api_request_failed', e, { endpointOrUrl, method });
    throw e;
  }
}
