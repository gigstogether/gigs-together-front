import { fetchApiJson } from '@/lib/api-core';
import { isRecord } from '@/lib/is-record';
import { TELEGRAM_INIT_DATA_HEADER } from '@/lib/telegram-init-data-header';
import { waitForTelegramInitData } from '@/lib/telegram-webapp';
import type { EnsureTelegramAccessTokenOptions } from '@/types/ensure-telegram-access-token-options';
import type { TelegramWidgetUser } from '@/types/telegram-login';

const STORAGE_KEY = 'gt_tg_access_token';

const accessTokenListeners = new Set<() => void>();
let isStorageListenerAttached = false;

function emitAccessTokenListeners(): void {
  accessTokenListeners.forEach((listener) => listener());
}

function attachCrossTabAccessTokenListener(): void {
  if (typeof window === 'undefined' || isStorageListenerAttached) {
    return;
  }
  isStorageListenerAttached = true;
  window.addEventListener('storage', (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      emitAccessTokenListeners();
    }
  });
}

export function subscribeTelegramAccessToken(listener: () => void): () => void {
  accessTokenListeners.add(listener);
  attachCrossTabAccessTokenListener();
  return () => {
    accessTokenListeners.delete(listener);
  };
}

export function getTelegramAccessTokenSnapshot(): string | null {
  return getStoredTelegramAccessToken();
}

export interface TelegramExchangeResponse {
  readonly accessToken: string;
  readonly expiresIn: number;
}

function parseExchangeResponse(raw: unknown): TelegramExchangeResponse {
  if (!isRecord(raw)) {
    throw new Error('Invalid auth exchange response');
  }
  const accessToken = raw.accessToken;
  const expiresIn = raw.expiresIn;
  if (typeof accessToken !== 'string' || !accessToken.trim()) {
    throw new Error('Invalid auth exchange response: accessToken');
  }
  if (typeof expiresIn !== 'number' || !Number.isFinite(expiresIn)) {
    throw new Error('Invalid auth exchange response: expiresIn');
  }
  return { accessToken, expiresIn };
}

export function getStoredTelegramAccessToken(): string | null {
  if (typeof sessionStorage === 'undefined') return null;
  return sessionStorage.getItem(STORAGE_KEY);
}

export function setStoredTelegramAccessToken(token: string): void {
  sessionStorage.setItem(STORAGE_KEY, token);
  emitAccessTokenListeners();
}

export function clearStoredTelegramAccessToken(): void {
  sessionStorage.removeItem(STORAGE_KEY);
  emitAccessTokenListeners();
}

function parseJwtExpSec(token: string): number | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const json = atob(parts[1]);
    const payload: unknown = JSON.parse(json);
    if (!isRecord(payload)) return null;
    const exp = payload.exp;
    return typeof exp === 'number' && Number.isFinite(exp) ? exp : null;
  } catch {
    return null;
  }
}

/**
 * @param skewSec Seconds before JWT `exp` to treat token as expired (clock skew).
 * Default 60 s = 1 min.
 */
export function isTelegramAccessTokenExpired(token: string, skewSec = 60): boolean {
  const exp = parseJwtExpSec(token);
  if (exp === null) return true;
  const nowSec = Math.floor(Date.now() / 1000);
  return exp <= nowSec + skewSec;
}

function tryParseJwtPayloadUnknown(token: string): unknown | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const json = atob(parts[1]);
    const payload: unknown = JSON.parse(json);
    return payload;
  } catch {
    return null;
  }
}

/**
 * Reads display label from JWT payload for UI (not verified; API is authoritative).
 */
function tryTelegramDisplayLabelFromAccessJwtPayload(payload: unknown): string | null {
  if (!isRecord(payload)) return null;
  const identity = payload.identity;
  if (!isRecord(identity)) return null;
  if (identity.kind !== 'telegram') return null;
  const snapshot = identity.snapshot;
  if (!isRecord(snapshot)) return null;
  const username = snapshot.username;
  const firstName = snapshot.firstName;
  if (typeof username === 'string' && username.trim()) {
    return `@${username}`;
  }
  if (typeof firstName === 'string' && firstName.trim()) {
    return firstName;
  }
  return null;
}

export function getTelegramAccessDisplayLabelFromToken(token: string): string | null {
  const payload = tryParseJwtPayloadUnknown(token);
  if (payload === null) return null;
  return tryTelegramDisplayLabelFromAccessJwtPayload(payload);
}

export async function exchangeTelegramAccessTokenFromWebApp(initData: string): Promise<void> {
  const raw = await fetchApiJson<unknown>(
    'v1/auth/telegram/web-app',
    'POST',
    {},
    {
      headers: { [TELEGRAM_INIT_DATA_HEADER]: initData },
    },
  );
  const { accessToken } = parseExchangeResponse(raw);
  setStoredTelegramAccessToken(accessToken);
}

/**
 * Exchanges Telegram Login Widget callback data for an access JWT and persists it to
 * session storage (`gt_tg_access_token`), same as {@link exchangeTelegramAccessTokenFromWebApp} for the mini app.
 */
export async function exchangeTelegramAccessTokenFromLoginWidget(
  user: TelegramWidgetUser,
): Promise<TelegramExchangeResponse> {
  const raw = await fetchApiJson<unknown>('v1/auth/telegram/login-widget', 'POST', user);
  const response = parseExchangeResponse(raw);
  setStoredTelegramAccessToken(response.accessToken);
  return response;
}

/**
 * Ensures a valid JWT is in session storage, exchanging initData with the API when needed.
 */
export async function ensureTelegramAccessToken(
  options?: EnsureTelegramAccessTokenOptions,
): Promise<void> {
  const existing = getStoredTelegramAccessToken();
  if (existing && !isTelegramAccessTokenExpired(existing)) {
    return;
  }
  const initData = await waitForTelegramInitData(options);
  await exchangeTelegramAccessTokenFromWebApp(initData);
}
