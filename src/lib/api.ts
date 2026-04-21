import { fetchApiJson } from '@/lib/api-core';
import { logger } from '@/lib/logger';
import { clearStoredTelegramClientProfile, requestTelegramSignIn } from '@/lib/telegram-auth';
import { isTelegramMiniApp } from '@/lib/telegram-webapp';

export {
  ApiError,
  TELEGRAM_INIT_DATA_EXPIRED_CODE,
  isTelegramInitDataExpiredError,
} from '@/lib/api-errors';

type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export async function apiRequest<TResponse = unknown, TBody = unknown>(
  endpointOrUrl: string,
  method: HttpMethod,
  data?: TBody,
  init?: RequestInit,
): Promise<TResponse> {
  try {
    const headers = new Headers(init?.headers);
    return await fetchApiJson<TResponse>(endpointOrUrl, method, data, {
      ...init,
      headers,
      onUnauthorized: () => {
        clearStoredTelegramClientProfile();
        if (!isTelegramMiniApp()) {
          requestTelegramSignIn();
        }
      },
    });
  } catch (e) {
    logger.errorFromUnknown('api_request_failed', e, { endpointOrUrl, method });
    throw e;
  }
}
