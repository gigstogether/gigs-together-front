import { fetchApiJson } from '@/lib/api-core';
import { isRecord } from '@/lib/is-record';
import { waitForTelegramInitData } from '@/lib/telegram-webapp';
import type { EnsureTelegramAuthOptions } from '@/types/ensure-telegram-auth-options';
import type { TelegramAuthExchangeResponse } from '@/types/telegram-auth-exchange-response';
import type { TelegramStoredClientProfile } from '@/types/telegram-client-profile';
import type { TelegramWidgetUser } from '@/types/telegram-login';

export type { TelegramAuthExchangeResponse };

/** Default localStorage key for the non-sensitive Telegram profile cache. */
const DEFAULT_TELEGRAM_CLIENT_PROFILE_STORAGE_KEY = 'gt_tg_client_profile';

/**
 * localStorage key for the cached Telegram profile (`NEXT_PUBLIC_*` is inlined at build time).
 */
function getTelegramClientProfileStorageKey(): string {
  const raw = process.env.NEXT_PUBLIC_TELEGRAM_CLIENT_PROFILE_STORAGE_KEY;
  const trimmed = typeof raw === 'string' ? raw.trim() : '';
  return trimmed || DEFAULT_TELEGRAM_CLIENT_PROFILE_STORAGE_KEY;
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

export function getTelegramClientProfileSnapshot(): TelegramStoredClientProfile | null {
  return getStoredTelegramClientProfile();
}

function parseAuthExchangeResponse(raw: unknown): TelegramAuthExchangeResponse {
  if (!isRecord(raw)) {
    throw new Error('Invalid auth exchange response');
  }
  const expiresIn = raw.expiresIn;
  const profileRaw = raw.profile;
  if (typeof expiresIn !== 'number' || !Number.isFinite(expiresIn)) {
    throw new Error('Invalid auth exchange response: expiresIn');
  }
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
  const profile: TelegramStoredClientProfile = {
    displayLabel: displayLabel.trim(),
    ...(photoUrl ? { photoUrl } : {}),
  };
  return { expiresIn, profile };
}

export function getStoredTelegramClientProfile(): TelegramStoredClientProfile | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getTelegramClientProfileStorageKey());
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    const displayLabel = parsed.displayLabel;
    if (typeof displayLabel !== 'string' || !displayLabel.trim()) return null;
    const photoUrlRaw = parsed.photoUrl;
    if (photoUrlRaw !== undefined && (typeof photoUrlRaw !== 'string' || !photoUrlRaw.trim())) {
      return null;
    }
    return {
      displayLabel: displayLabel.trim(),
      ...(typeof photoUrlRaw === 'string' && photoUrlRaw.trim()
        ? { photoUrl: photoUrlRaw.trim() }
        : {}),
    };
  } catch {
    return null;
  }
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

export async function logoutTelegramAuthOnServer(): Promise<void> {
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

/**
 * Ensures Web App `initData` is exchanged when there is no local profile. Cookie validity is
 * enforced by the API; 401 responses clear the profile via `apiRequest`.
 */
// TODO: this either should not happen or should happen with web version as well - not only in mini app
export async function ensureTelegramAuth(options?: EnsureTelegramAuthOptions): Promise<void> {
  if (getStoredTelegramClientProfile()) {
    return;
  }
  const initData = await waitForTelegramInitData(options);
  await exchangeTelegramAuthFromWebApp(initData);
}
