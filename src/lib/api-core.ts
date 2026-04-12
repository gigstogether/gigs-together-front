import { ApiError } from '@/lib/api-errors';
import { isRecord } from '@/lib/is-record';

type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_API_BASE_URL;

export interface FetchApiJsonOptions extends RequestInit {
  onUnauthorized?: () => void;
  /**
   * Internal: set after one `POST v1/auth/refresh` so a second 401 does not loop refresh.
   */
  hasAttemptedTokenRefresh?: boolean;
  /**
   * Internal: set after one Telegram Mini App re-auth so a second 401 does not loop re-auth.
   */
  hasAttemptedTelegramMiniAppReauth?: boolean;
}

export function buildUrl(endpointOrUrl: string): string {
  if (/^https?:\/\//i.test(endpointOrUrl)) return endpointOrUrl;
  if (!API_BASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_APP_API_BASE_URL for direct API calls');
  }
  return `${API_BASE_URL.replace(/\/$/, '')}/${endpointOrUrl.replace(/^\//, '')}`;
}

function isAuthRefreshEndpoint(endpointOrUrl: string): boolean {
  return endpointOrUrl.includes('v1/auth/refresh');
}

function isTelegramWebAppAuthEndpoint(endpointOrUrl: string): boolean {
  return endpointOrUrl.includes('v1/auth/telegram/web-app');
}

let telegramMiniAppReauthPromise: Promise<boolean> | null = null;

async function postTelegramMiniAppReauth(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }

  if (!telegramMiniAppReauthPromise) {
    telegramMiniAppReauthPromise = (async () => {
      try {
        const { isTelegramMiniApp, waitForTelegramInitData } = await import(
          '@/lib/telegram-webapp'
        );
        if (!isTelegramMiniApp()) {
          return false;
        }

        const initData = await waitForTelegramInitData();
        const response = await fetch(buildUrl('v1/auth/telegram/web-app'), {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ initData }),
        });
        return response.ok;
      } catch {
        return false;
      } finally {
        telegramMiniAppReauthPromise = null;
      }
    })();
  }

  return telegramMiniAppReauthPromise;
}

export async function fetchApiJson<TResponse>(
  endpointOrUrl: string,
  method: HttpMethod,
  data?: unknown,
  init?: FetchApiJsonOptions,
): Promise<TResponse> {
  const {
    onUnauthorized,
    hasAttemptedTokenRefresh,
    hasAttemptedTelegramMiniAppReauth,
    ...fetchInit
  } = init ?? {};
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;

  const headers = new Headers(fetchInit.headers);
  if (isFormData) {
    if (headers.has('Content-Type')) headers.delete('Content-Type');
  } else if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const body =
    method !== 'GET' && method !== 'HEAD' && data !== undefined
      ? isFormData
        ? data
        : JSON.stringify(data)
      : undefined;

  const response = await fetch(buildUrl(endpointOrUrl), {
    ...fetchInit,
    method,
    headers,
    body,
    credentials: fetchInit.credentials ?? 'include',
  });

  // TODO: single-flight refresh — concurrent 401s each call `postAuthRefresh()` today; share one in-flight
  // `POST v1/auth/refresh` (or a shared Promise) so parallel requests await the same rotation.
  if (
    response.status === 401 &&
    !hasAttemptedTokenRefresh &&
    !isAuthRefreshEndpoint(endpointOrUrl)
  ) {
    const { postAuthRefresh } = await import('@/lib/auth-refresh');
    const refreshed = await postAuthRefresh();
    if (refreshed) {
      return fetchApiJson<TResponse>(endpointOrUrl, method, data, {
        ...init,
        hasAttemptedTokenRefresh: true,
      });
    }
  }

  if (
    response.status === 401 &&
    !hasAttemptedTelegramMiniAppReauth &&
    !isAuthRefreshEndpoint(endpointOrUrl) &&
    !isTelegramWebAppAuthEndpoint(endpointOrUrl)
  ) {
    const isReauthenticated = await postTelegramMiniAppReauth();
    if (isReauthenticated) {
      return fetchApiJson<TResponse>(endpointOrUrl, method, data, {
        ...init,
        hasAttemptedTelegramMiniAppReauth: true,
      });
    }
  }

  const contentType = response.headers.get('Content-Type') || '';
  const isJson = contentType.includes('application/json');

  const result = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    if (response.status === 401 && onUnauthorized) {
      onUnauthorized();
    }
    if (isRecord(result)) {
      const r = result;
      const msg =
        typeof r.message === 'string' && r.message.trim() ? r.message : 'Something went wrong';
      const code = typeof r.code === 'string' ? r.code : undefined;
      throw new ApiError(msg, response.status, code);
    }
    throw new Error(typeof result === 'string' ? result : 'Something went wrong');
  }

  return result as TResponse;
}
