/** Launch params Telegram puts in the URL hash (not gig deep-link fragments). */
export const TELEGRAM_LAUNCH_HASH_PARAM_KEYS = [
  'tgWebAppData',
  'tgWebAppVersion',
  'tgWebAppPlatform',
  'tgWebAppThemeParams',
  'tgWebAppShowSettings',
  'tgWebAppBotInline',
  'tgWebAppStartParam',
  'tgWebAppFullscreen',
] as const;

/** Launch params Telegram may put in the query string. */
export const TELEGRAM_LAUNCH_SEARCH_PARAM_KEYS = [
  'tgWebAppData',
  'tgWebAppStartParam',
  'startapp',
] as const;

export interface TelegramLaunchParamsSnapshot {
  readonly initData?: string;
  readonly startParam?: string;
}

const TELEGRAM_MINI_APP_STORAGE_KEY = 'gt_tg_is_mini_app';
const TELEGRAM_MINI_APP_STORAGE_VALUE = '1';

let launchParamsSnapshot: TelegramLaunchParamsSnapshot | undefined;
let didCaptureLaunchParams = false;

export function resetTelegramLaunchParamsCaptureForTests(): void {
  launchParamsSnapshot = undefined;
  didCaptureLaunchParams = false;
  try {
    localStorage.removeItem(TELEGRAM_MINI_APP_STORAGE_KEY);
  } catch {
    /* ignore test cleanup failures */
  }
}

export function getTelegramLaunchParamsSnapshot(): TelegramLaunchParamsSnapshot | undefined {
  return launchParamsSnapshot;
}

/**
 * Reads Telegram launch params from the current URL into memory and clears them from the address bar.
 * Call as early as possible (see `instrumentation-client.ts`). Safe to call more than once.
 */
export function captureTelegramLaunchParamsFromUrl(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  if (!didCaptureLaunchParams) {
    didCaptureLaunchParams = true;

    const searchParams = new URLSearchParams(window.location.search);
    const hashFragment = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash;
    const hashParams = hashFragment ? new URLSearchParams(hashFragment) : null;

    const initData =
      hashParams?.get('tgWebAppData') ?? searchParams.get('tgWebAppData') ?? undefined;
    const startParam =
      hashParams?.get('tgWebAppStartParam') ??
      searchParams.get('tgWebAppStartParam') ??
      searchParams.get('startapp') ??
      undefined;

    if (initData ?? startParam) {
      launchParamsSnapshot = {
        ...(initData ? { initData } : {}),
        ...(startParam ? { startParam } : {}),
      };
      persistTelegramMiniAppMarker();
    }
  }

  return clearTelegramLaunchParamsFromUrl();
}

export function getTelegramInitData(): string {
  return window.Telegram?.WebApp?.initData ?? getTelegramInitDataFromLocation() ?? '';
}

/**
 * Removes Telegram Mini App launch params from the URL.
 * Keeps unrelated hash fragments (for example gig `#publicId` deep links).
 */
export function clearTelegramLaunchParamsFromUrl(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const { pathname, search, hash } = window.location;
  const searchParams = new URLSearchParams(search);
  let searchChanged = false;

  for (const key of TELEGRAM_LAUNCH_SEARCH_PARAM_KEYS) {
    if (searchParams.has(key)) {
      searchParams.delete(key);
      searchChanged = true;
    }
  }

  const hashFragment = hash.startsWith('#') ? hash.slice(1) : hash;
  let nextHash = hash;
  if (hashFragment) {
    const hashParams = new URLSearchParams(hashFragment);
    const hasTelegramHashKey = TELEGRAM_LAUNCH_HASH_PARAM_KEYS.some((key) => hashParams.has(key));
    if (hasTelegramHashKey) {
      for (const key of TELEGRAM_LAUNCH_HASH_PARAM_KEYS) {
        hashParams.delete(key);
      }
      const remaining = hashParams.toString();
      nextHash = remaining ? `#${remaining}` : '';
    }
  }

  if (!searchChanged && nextHash === hash) {
    return false;
  }

  const nextSearch = searchParams.toString();
  const url = `${pathname}${nextSearch ? `?${nextSearch}` : ''}${nextHash}`;
  window.history.replaceState(null, '', url);
  return true;
}

/**
 * Whether the app runs inside Telegram (Mini App). Uses initData / URL fallbacks and
 * `initDataUnsafe.user` when the Web App script has run. Call only on the client.
 */
export function isTelegramMiniApp(): boolean {
  if (typeof window === 'undefined') return false;
  if (hasPersistedTelegramMiniAppMarker()) return true;
  if (getTelegramInitData()) {
    persistTelegramMiniAppMarker();
    return true;
  }
  const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
  if (typeof user?.id === 'number') {
    persistTelegramMiniAppMarker();
    return true;
  }
  return false;
}

function getTelegramInitDataFromLocation(): string | undefined {
  if (launchParamsSnapshot?.initData) {
    return launchParamsSnapshot.initData;
  }

  if (didCaptureLaunchParams) {
    return undefined;
  }

  const hash = (window.location.hash ?? '').replace(/^#/, '');
  const fromHash = hash ? new URLSearchParams(hash).get('tgWebAppData') : null;
  if (fromHash) return fromHash;

  const fromSearch = new URLSearchParams(window.location.search).get('tgWebAppData');
  if (fromSearch) return fromSearch;

  return undefined;
}

export function getTelegramStartParam(): string {
  const fromSnapshot = launchParamsSnapshot?.startParam;
  if (fromSnapshot) {
    return fromSnapshot;
  }

  const raw =
    window.Telegram?.WebApp?.initDataUnsafe?.start_param ||
    new URLSearchParams(window.location.search).get('tgWebAppStartParam') ||
    new URLSearchParams(window.location.search).get('startapp');
  return (raw ?? '').toString();
}

function hasPersistedTelegramMiniAppMarker(): boolean {
  if (typeof localStorage === 'undefined') {
    return false;
  }

  try {
    return localStorage.getItem(TELEGRAM_MINI_APP_STORAGE_KEY) === TELEGRAM_MINI_APP_STORAGE_VALUE;
  } catch (error: unknown) {
    console.error('Failed to read Telegram Mini App marker from localStorage.', error);
    return false;
  }
}

function persistTelegramMiniAppMarker(): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(TELEGRAM_MINI_APP_STORAGE_KEY, TELEGRAM_MINI_APP_STORAGE_VALUE);
  } catch (error: unknown) {
    console.error('Failed to persist Telegram Mini App marker in localStorage.', error);
  }
}

export interface WaitForTelegramInitDataOptions {
  readonly signal?: AbortSignal;
  readonly timeoutMs?: number;
  readonly intervalMs?: number;
}

export async function waitForTelegramInitData(
  options?: WaitForTelegramInitDataOptions,
): Promise<string> {
  // 10_000 ms = 10 s poll budget for Mini App initData
  const timeoutMs = options?.timeoutMs ?? 10_000;
  // 100 ms between polls
  const intervalMs = options?.intervalMs ?? 100;

  const start = Date.now();

  while (Date.now() - start <= timeoutMs) {
    if (options?.signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }
    const initData = getTelegramInitData();
    if (initData) return initData;
    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error(
    'Telegram initData is not available. Open this page from inside Telegram (Mini App).',
  );
}
