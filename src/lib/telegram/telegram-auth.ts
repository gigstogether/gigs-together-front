import { fetchApiJson } from '@/lib/api-core';
import { clientEnv } from '@/env/client-env';
import { isRecord } from '@/lib/is-record';
import { logger } from '@/lib/logger';
import type { TelegramAuthExchangeResponse } from '@/lib/telegram/telegram-auth-exchange-response.types';
import type { TelegramStoredClientProfile } from '@/lib/telegram/telegram-client-profile.types';
import type { TelegramWidgetUser } from '@/lib/telegram/telegram-login.types';

export type { TelegramAuthExchangeResponse };

const TELEGRAM_SIGN_IN_REQUIRED_EVENT = 'gt:telegram-sign-in-required';
const telegramMiniAppBootstrapListeners = new Set<() => void>();
export type TelegramMiniAppBootstrapResult = 'authenticated' | 'not-mini-app' | 'failed';

let telegramMiniAppBootstrapPromise: Promise<TelegramMiniAppBootstrapResult> | null = null;
let isTelegramMiniAppBootstrapPending = false;

/**
 * localStorage key for the cached Telegram profile (`NEXT_PUBLIC_*` is inlined at build time).
 */
function getTelegramClientProfileStorageKey(): string {
  return clientEnv.telegramClientProfileStorageKey;
}

/** Subscribers for `useSyncExternalStore` + same-tab updates after localStorage writes. */
const telegramClientProfileListeners = new Set<() => void>();
let isCrossTabStorageListenerAttached = false;

function notifyTelegramClientProfileListeners(): void {
  telegramClientProfileListeners.forEach((listener) => listener());
}

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

/** `storage` fires for other tabs; same-tab updates call {@link notifyTelegramClientProfileListeners} explicitly. */
function ensureCrossTabStorageListenerAttached(): void {
  if (typeof window === 'undefined' || isCrossTabStorageListenerAttached) {
    return;
  }
  isCrossTabStorageListenerAttached = true;
  window.addEventListener('storage', (event: StorageEvent) => {
    if (event.key === getTelegramClientProfileStorageKey() || event.key === null) {
      notifyTelegramClientProfileListeners();
    }
  });
}

export function subscribeTelegramClientProfile(listener: () => void): () => void {
  telegramClientProfileListeners.add(listener);
  ensureCrossTabStorageListenerAttached();
  return () => {
    telegramClientProfileListeners.delete(listener);
  };
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

/**
 * Last `localStorage` payload for the profile key and its parsed value. `useSyncExternalStore`
 * requires {@link getTelegramClientProfileSnapshot} to return the same object reference when the
 * underlying storage string is unchanged (see React `getSnapshot` caching).
 */
let lastProfileStorageRaw: string | null | undefined;
let lastProfileStorageParsed: TelegramStoredClientProfile | null | undefined;

function parseStoredProfileJson(raw: string): TelegramStoredClientProfile | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    const displayLabel = parsed.displayLabel;
    if (typeof displayLabel !== 'string' || !displayLabel.trim()) return null;
    const photoUrlRaw = parsed.photoUrl;
    if (photoUrlRaw !== undefined && (typeof photoUrlRaw !== 'string' || !photoUrlRaw.trim())) {
      return null;
    }
    const isAdmin = parsed.isAdmin;
    if (typeof isAdmin !== 'boolean') {
      return null;
    }
    return {
      displayLabel: displayLabel.trim(),
      ...(typeof photoUrlRaw === 'string' && photoUrlRaw.trim()
        ? { photoUrl: photoUrlRaw.trim() }
        : {}),
      isAdmin,
    };
  } catch {
    return null;
  }
}

export function getTelegramClientProfileSnapshot(): TelegramStoredClientProfile | null {
  return getStoredTelegramClientProfile();
}

function parseAuthExchangeResponse(raw: unknown): TelegramAuthExchangeResponse {
  if (!isRecord(raw)) {
    throw new Error('Invalid auth exchange response');
  }
  const profileRaw = raw.profile;
  if (!isRecord(profileRaw)) {
    throw new Error('Invalid auth exchange response: profile');
  }
  const displayLabel = profileRaw.displayLabel;
  if (typeof displayLabel !== 'string' || !displayLabel.trim()) {
    throw new Error('Invalid auth exchange response: profile.displayLabel');
  }
  const photoUrlRaw = profileRaw.photoUrl;
  let photoUrl: string | undefined;
  if (photoUrlRaw !== undefined) {
    if (typeof photoUrlRaw !== 'string' || !photoUrlRaw.trim()) {
      throw new Error('Invalid auth exchange response: profile.photoUrl');
    }
    photoUrl = photoUrlRaw.trim();
  }
  const isAdmin = profileRaw.isAdmin;
  if (typeof isAdmin !== 'boolean') {
    throw new Error('Invalid auth exchange response: profile.isAdmin');
  }
  const profile: TelegramStoredClientProfile = {
    displayLabel: displayLabel.trim(),
    ...(photoUrl ? { photoUrl } : {}),
    isAdmin,
  };
  return { profile };
}

export function getStoredTelegramClientProfile(): TelegramStoredClientProfile | null {
  if (typeof localStorage === 'undefined') return null;
  let raw: string | null;
  try {
    raw = localStorage.getItem(getTelegramClientProfileStorageKey());
  } catch {
    lastProfileStorageRaw = undefined;
    return null;
  }
  if (raw === lastProfileStorageRaw) {
    return lastProfileStorageParsed ?? null;
  }
  lastProfileStorageRaw = raw;
  if (!raw) {
    lastProfileStorageParsed = null;
    return null;
  }
  const parsed = parseStoredProfileJson(raw);
  lastProfileStorageParsed = parsed;
  return parsed;
}

export function setStoredTelegramClientProfile(profile: TelegramStoredClientProfile): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(getTelegramClientProfileStorageKey(), JSON.stringify(profile));
    notifyTelegramClientProfileListeners();
  } catch {
    /* quota / private mode */
  }
}

export function clearStoredTelegramClientProfile(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(getTelegramClientProfileStorageKey());
  } catch {
    /* ignore */
  }
  notifyTelegramClientProfileListeners();
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
    /* best-effort: still clear local profile */
  }
}

export async function exchangeTelegramAuthFromWebApp(initData: string): Promise<void> {
  const raw = await fetchApiJson<unknown>(
    'v1/auth/telegram/web-app',
    'POST',
    {
      initData,
    },
    { credentials: 'include' },
  );
  const { profile } = parseAuthExchangeResponse(raw);
  setStoredTelegramClientProfile(profile);
}

export async function bootstrapTelegramAuthFromWebApp(): Promise<TelegramMiniAppBootstrapResult> {
  if (typeof window === 'undefined') {
    return 'not-mini-app';
  }

  if (!telegramMiniAppBootstrapPromise) {
    setTelegramMiniAppBootstrapPending(true);
    telegramMiniAppBootstrapPromise = (async () => {
      try {
        const { isTelegramMiniApp, waitForTelegramInitData } = await import(
          '@/lib/telegram/telegram-webapp'
        );
        if (!isTelegramMiniApp()) {
          return 'not-mini-app';
        }
        const initData = await waitForTelegramInitData();
        await exchangeTelegramAuthFromWebApp(initData);
        return 'authenticated';
      } catch (e) {
        logger.errorFromUnknown('telegram_mini_app_bootstrap_failed', e);
        return 'failed';
      } finally {
        telegramMiniAppBootstrapPromise = null;
        setTelegramMiniAppBootstrapPending(false);
      }
    })();
  }

  return telegramMiniAppBootstrapPromise;
}

/**
 * Telegram Login Widget: exchanges the callback payload for an access JWT (HttpOnly cookie) and
 * persists the non-sensitive profile in localStorage (see `NEXT_PUBLIC_TELEGRAM_CLIENT_PROFILE_STORAGE_KEY`).
 */
export async function exchangeTelegramAuthFromLoginWidget(
  user: TelegramWidgetUser,
): Promise<TelegramAuthExchangeResponse> {
  const raw = await fetchApiJson<unknown>('v1/auth/telegram/login-widget', 'POST', user, {
    credentials: 'include',
  });
  const response = parseAuthExchangeResponse(raw);
  setStoredTelegramClientProfile(response.profile);
  return response;
}
