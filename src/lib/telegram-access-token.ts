import { fetchApiJson } from '@/lib/api-core';
import { TELEGRAM_INIT_DATA_HEADER } from '@/lib/telegram-init-data-header';
import { waitForTelegramInitData } from '@/lib/telegram-webapp';

const STORAGE_KEY = 'gt_tg_access_token';

export interface TelegramExchangeResponse {
  accessToken: string;
  expiresIn: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
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
}

export function clearStoredTelegramAccessToken(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

function parseJwtExpSec(token: string): number | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const json = atob(parts[1]);
    const payload = JSON.parse(json) as unknown;
    if (!isRecord(payload)) return null;
    const exp = payload.exp;
    return typeof exp === 'number' && Number.isFinite(exp) ? exp : null;
  } catch {
    return null;
  }
}

export function isTelegramAccessTokenExpired(token: string, skewSec = 60): boolean {
  const exp = parseJwtExpSec(token);
  if (exp === null) return true;
  const nowSec = Math.floor(Date.now() / 1000);
  return exp <= nowSec + skewSec;
}

export async function exchangeTelegramAccessToken(initData: string): Promise<void> {
  const raw = await fetchApiJson<unknown>(
    'v1/auth/telegram',
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
 * Ensures a valid JWT is in session storage, exchanging initData with the API when needed.
 */
export async function ensureTelegramAccessToken(options?: { signal?: AbortSignal }): Promise<void> {
  const existing = getStoredTelegramAccessToken();
  if (existing && !isTelegramAccessTokenExpired(existing)) {
    return;
  }
  const initData = await waitForTelegramInitData(options);
  await exchangeTelegramAccessToken(initData);
}
