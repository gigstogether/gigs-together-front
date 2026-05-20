import { fetchApiJson } from '@/lib/api-core';
import { parseAuthClientProfileResponseBody } from '@/lib/parse-auth-client-profile-response';
import type { AuthClientProfileResponseBody } from '@/types/auth-client-profile';
import type { TelegramAuthExchangeResponse } from '@/types/telegram-auth-exchange-response';
import type { TelegramWidgetUser } from '@/types/telegram-login';

export type { TelegramAuthExchangeResponse };

const TELEGRAM_SIGN_IN_REQUIRED_EVENT = 'gt:telegram-sign-in-required';
const telegramMiniAppBootstrapListeners = new Set<() => void>();
let telegramMiniAppBootstrapPromise: Promise<boolean> | null = null;
let isTelegramMiniAppBootstrapPending = false;

function notifyTelegramMiniAppBootstrapListeners(): void {
  telegramMiniAppBootstrapListeners.forEach((listener) => listener());
}

function setTelegramMiniAppBootstrapPending(next: boolean): void {
  if (isTelegramMiniAppBootstrapPending === next) {
    return;
  }
  isTelegramMiniAppBootstrapPending = next;
  notifyTelegramMiniAppBootstrapListeners();
}

export function subscribeTelegramMiniAppBootstrap(listener: () => void): () => void {
  telegramMiniAppBootstrapListeners.add(listener);
  return () => {
    telegramMiniAppBootstrapListeners.delete(listener);
  };
}

export function getTelegramMiniAppBootstrapSnapshot(): boolean {
  return isTelegramMiniAppBootstrapPending;
}

function parseAuthExchangeResponse(raw: unknown): AuthClientProfileResponseBody {
  return parseAuthClientProfileResponseBody(raw);
}

export function requestTelegramSignIn(): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(new Event(TELEGRAM_SIGN_IN_REQUIRED_EVENT));
}

export function subscribeTelegramSignInRequest(listener: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handleRequest = (): void => {
    listener();
  };

  window.addEventListener(TELEGRAM_SIGN_IN_REQUIRED_EVENT, handleRequest);
  return () => {
    window.removeEventListener(TELEGRAM_SIGN_IN_REQUIRED_EVENT, handleRequest);
  };
}

/** Clears HttpOnly session cookies on the server (best-effort). */
export async function signOutTelegramAuthOnServer(): Promise<void> {
  try {
    await fetchApiJson<unknown>('v1/auth/logout', 'POST', undefined, {
      credentials: 'include',
    });
  } catch {
    /* best-effort */
  }
}

export async function exchangeTelegramAuthFromWebApp(initData: string): Promise<void> {
  await fetchApiJson<unknown>(
    'v1/auth/telegram/web-app',
    'POST',
    {
      initData,
    },
    { credentials: 'include' },
  );
}

export async function bootstrapTelegramAuthFromWebApp(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }

  if (!telegramMiniAppBootstrapPromise) {
    setTelegramMiniAppBootstrapPending(true);
    telegramMiniAppBootstrapPromise = (async () => {
      try {
        const { isTelegramMiniApp, waitForTelegramInitData } = await import(
          '@/lib/telegram-webapp'
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
        telegramMiniAppBootstrapPromise = null;
        setTelegramMiniAppBootstrapPending(false);
      }
    })();
  }

  return telegramMiniAppBootstrapPromise;
}

/** Exchanges Telegram Login Widget payload for HttpOnly session cookies. */
export async function exchangeTelegramAuthFromLoginWidget(
  user: TelegramWidgetUser,
): Promise<TelegramAuthExchangeResponse> {
  const raw = await fetchApiJson<unknown>('v1/auth/telegram/login-widget', 'POST', user, {
    credentials: 'include',
  });
  return parseAuthExchangeResponse(raw);
}
