import { ApiError } from '@/lib/api-errors';
import { fetchApiJson } from '@/lib/api-core';
import type { FetchApiJsonOptions } from '@/lib/api-core';
import { postAuthRefresh } from '@/lib/auth-refresh';
import { exchangeTelegramAuthFromWebApp } from '@/lib/telegram/telegram-auth';

type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface SessionRecoveryState {
  hasAttemptedTokenRefresh?: boolean;
  hasAttemptedTelegramMiniAppReauth?: boolean;
}

export interface FetchApiJsonWithSessionRecoveryOptions {
  init?: Omit<FetchApiJsonOptions, 'credentials'>;
  onUnauthorized?: () => void;
  recoveryState?: SessionRecoveryState;
}

function isAuthRefreshEndpoint(endpointOrUrl: string): boolean {
  return endpointOrUrl.includes('v1/auth/refresh');
}

function isTelegramWebAppAuthEndpoint(endpointOrUrl: string): boolean {
  return endpointOrUrl.includes('v1/auth/telegram/web-app');
}

let authRefreshPromise: Promise<boolean> | null = null;
let telegramMiniAppReauthPromise: Promise<boolean> | null = null;

async function postAuthRefreshSingleFlight(): Promise<boolean> {
  if (!authRefreshPromise) {
    authRefreshPromise = (async () => {
      try {
        return await postAuthRefresh();
      } finally {
        authRefreshPromise = null;
      }
    })();
  }

  return authRefreshPromise;
}

async function postTelegramMiniAppReauth(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }

  if (!telegramMiniAppReauthPromise) {
    telegramMiniAppReauthPromise = (async () => {
      try {
        const { isTelegramMiniApp, waitForTelegramInitData } = await import(
          '@/lib/telegram/telegram-webapp'
        );
        if (!isTelegramMiniApp()) {
          return false;
        }

        const initData = await waitForTelegramInitData();
        await exchangeTelegramAuthFromWebApp(initData);
        return true;
      } catch {
        return false;
      } finally {
        telegramMiniAppReauthPromise = null;
      }
    })();
  }

  return telegramMiniAppReauthPromise;
}

export async function fetchApiJsonWithSessionRecovery<TResponse>(
  endpointOrUrl: string,
  method: HttpMethod,
  data: unknown | undefined,
  options: FetchApiJsonWithSessionRecoveryOptions,
): Promise<TResponse> {
  const { init, onUnauthorized, recoveryState = {} } = options;
  const { hasAttemptedTokenRefresh, hasAttemptedTelegramMiniAppReauth } = recoveryState;

  try {
    return await fetchApiJson<TResponse>(endpointOrUrl, method, data, {
      ...init,
      credentials: 'include',
    });
  } catch (e) {
    if (!(e instanceof ApiError) || e.statusCode !== 401) {
      throw e;
    }

    if (!hasAttemptedTokenRefresh && !isAuthRefreshEndpoint(endpointOrUrl)) {
      const refreshed = await postAuthRefreshSingleFlight();
      if (refreshed) {
        return fetchApiJsonWithSessionRecovery<TResponse>(endpointOrUrl, method, data, {
          init,
          onUnauthorized,
          recoveryState: {
            ...recoveryState,
            hasAttemptedTokenRefresh: true,
          },
        });
      }
    }

    if (
      !hasAttemptedTelegramMiniAppReauth &&
      !isAuthRefreshEndpoint(endpointOrUrl) &&
      !isTelegramWebAppAuthEndpoint(endpointOrUrl)
    ) {
      const isReauthenticated = await postTelegramMiniAppReauth();
      if (isReauthenticated) {
        return fetchApiJsonWithSessionRecovery<TResponse>(endpointOrUrl, method, data, {
          init,
          onUnauthorized,
          recoveryState: {
            ...recoveryState,
            hasAttemptedTokenRefresh: true,
            hasAttemptedTelegramMiniAppReauth: true,
          },
        });
      }
    }

    onUnauthorized?.();
    throw e;
  }
}
