import { fetchApiJson } from '@/lib/api-core';
import { clientEnv } from '@/env/client-env';
import { ApiError, isTelegramInitDataExpiredError } from '@/lib/api-errors';
import { isRecord } from '@/lib/is-record';
import { getTelegramInitData, isTelegramMiniApp } from '@/lib/telegram/telegram-webapp';
import type { TelegramAuthExchangeResponse } from '@/lib/telegram/telegram-auth-exchange-response.types';
import type { TelegramStoredClientProfile } from '@/lib/telegram/telegram-client-profile.types';

export type { TelegramAuthExchangeResponse };

export interface TelegramOidcCredentials {
  idToken: string;
}

const TELEGRAM_SIGN_IN_REQUIRED_EVENT = 'gt:telegram-sign-in-required';
const TELEGRAM_EXPLICIT_SIGN_IN_STORAGE_KEY = 'gt_tg_explicit_sign_in';
const TELEGRAM_EXPLICIT_SIGN_IN_STORAGE_VALUE = '1';
const TELEGRAM_INIT_DATA_EXPIRED_MESSAGE =
  'Telegram data has expired. Close and reopen the Mini App, then try again.';
let telegramMiniAppSignInPromise: Promise<void> | null = null;

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
  } catch (e: unknown) {
    console.error('Failed to persist Telegram client profile.', e);
  }
}

export function clearStoredTelegramClientProfile(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(getTelegramClientProfileStorageKey());
  } catch (e: unknown) {
    console.error('Failed to clear Telegram client profile.', e);
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

export function hasExplicitTelegramSignIn(): boolean {
  if (typeof localStorage === 'undefined') {
    return false;
  }

  try {
    return (
      localStorage.getItem(TELEGRAM_EXPLICIT_SIGN_IN_STORAGE_KEY) ===
      TELEGRAM_EXPLICIT_SIGN_IN_STORAGE_VALUE
    );
  } catch (e: unknown) {
    console.error('Failed to read explicit Telegram sign-in state.', e);
    return false;
  }
}

export function clearExplicitTelegramSignIn(): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(TELEGRAM_EXPLICIT_SIGN_IN_STORAGE_KEY);
  } catch (e: unknown) {
    console.error('Failed to clear explicit Telegram sign-in state.', e);
  }
}

function persistExplicitTelegramSignIn(): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(
      TELEGRAM_EXPLICIT_SIGN_IN_STORAGE_KEY,
      TELEGRAM_EXPLICIT_SIGN_IN_STORAGE_VALUE,
    );
  } catch (e: unknown) {
    console.error('Failed to persist explicit Telegram sign-in state.', e);
  }
}

/** Clears HttpOnly session cookies on the server (best-effort). */
export async function signOutTelegramAuthOnServer(): Promise<void> {
  try {
    await fetchApiJson<unknown>('v1/auth/logout', 'POST', undefined, {
      credentials: 'include',
    });
  } catch (e: unknown) {
    console.error('Failed to clear Telegram authentication cookies on the server.', e);
  }
}

export async function exchangeTelegramAuthFromWebApp(initData: string): Promise<void> {
  let raw: unknown;
  try {
    raw = await fetchApiJson<unknown>(
      'v1/auth/telegram/web-app',
      'POST',
      {
        initData,
      },
      { credentials: 'include' },
    );
  } catch (e) {
    if (isTelegramInitDataExpiredError(e)) {
      throw new ApiError(TELEGRAM_INIT_DATA_EXPIRED_MESSAGE, e.statusCode, e.code);
    }
    throw e;
  }
  const { profile } = parseAuthExchangeResponse(raw);
  setStoredTelegramClientProfile(profile);
}

export function signInWithTelegram(): Promise<void> {
  if (!isTelegramMiniApp()) {
    requestTelegramSignIn();
    return Promise.resolve();
  }

  if (!telegramMiniAppSignInPromise) {
    telegramMiniAppSignInPromise = (async () => {
      try {
        const initData = getTelegramInitData();
        await exchangeTelegramAuthFromWebApp(initData);
        persistExplicitTelegramSignIn();
      } finally {
        telegramMiniAppSignInPromise = null;
      }
    })();
  }

  return telegramMiniAppSignInPromise;
}

export async function exchangeTelegramAuthFromOidc(
  credentials: TelegramOidcCredentials,
): Promise<TelegramAuthExchangeResponse> {
  const raw = await fetchApiJson<unknown>('v1/auth/telegram/oidc', 'POST', credentials, {
    credentials: 'include',
  });
  const response = parseAuthExchangeResponse(raw);
  setStoredTelegramClientProfile(response.profile);
  persistExplicitTelegramSignIn();
  return response;
}
