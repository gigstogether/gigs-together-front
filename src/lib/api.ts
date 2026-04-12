import { fetchApiJson } from '@/lib/api-core';
import { clearStoredTelegramClientProfile, requestTelegramSignIn } from '@/lib/telegram-auth';

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
        requestTelegramSignIn();
      },
    });
  } catch (e) {
    console.error('API Error:', e);
    throw e;
  }
}
