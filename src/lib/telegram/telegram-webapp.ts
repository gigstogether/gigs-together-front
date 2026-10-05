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

interface TelegramLaunchParamsFromUrl {
  hasLaunchParams: boolean;
  snapshot?: TelegramLaunchParamsSnapshot;
}

const TELEGRAM_LAUNCH_PARAMS_STORAGE_KEY = 'gt_tg_launch_params';

export function getTelegramLaunchParamsSnapshot(): TelegramLaunchParamsSnapshot | undefined {
  if (typeof window === 'undefined') {
    return;
  }

  return readTelegramLaunchParamsSnapshotFromSessionStorage();
}

/**
 * Saves Telegram launch params from the current URL in sessionStorage and clears the address bar.
 * Call as early as possible (see `instrumentation-client.ts`). Safe to call more than once.
 */
export function captureTelegramLaunchParamsFromUrl(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const launchParams = readTelegramLaunchParamsFromUrl();
    if (launchParams.hasLaunchParams) {
      replaceTelegramLaunchParamsSnapshot(launchParams.snapshot);
    }
  } finally {
    clearTelegramLaunchParamsFromUrl();
  }
}

export function getTelegramInitData(): string {
  return getTelegramLaunchParamsSnapshot()?.initData ?? '';
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
 * Whether the app runs inside Telegram (Mini App). Uses launch params captured before hydration.
 */
export function isTelegramMiniApp(): boolean {
  return getTelegramLaunchParamsSnapshot() !== undefined;
}

export function getTelegramStartParam(): string {
  return getTelegramLaunchParamsSnapshot()?.startParam ?? '';
}

function readTelegramLaunchParamsFromUrl(): TelegramLaunchParamsFromUrl {
  const searchParams = new URLSearchParams(window.location.search);
  const hashFragment = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash;
  const hashParams = hashFragment ? new URLSearchParams(hashFragment) : null;
  const hasLaunchParams =
    TELEGRAM_LAUNCH_SEARCH_PARAM_KEYS.some((key) => searchParams.has(key)) ||
    TELEGRAM_LAUNCH_HASH_PARAM_KEYS.some((key) => hashParams?.has(key) ?? false);

  const initData = hashParams?.get('tgWebAppData') ?? searchParams.get('tgWebAppData') ?? undefined;
  const startParam =
    hashParams?.get('tgWebAppStartParam') ??
    searchParams.get('tgWebAppStartParam') ??
    searchParams.get('startapp') ??
    undefined;

  if (!initData && !startParam) {
    return { hasLaunchParams };
  }

  return {
    hasLaunchParams,
    snapshot: {
      ...(initData ? { initData } : {}),
      ...(startParam ? { startParam } : {}),
    },
  };
}

function replaceTelegramLaunchParamsSnapshot(
  snapshot: TelegramLaunchParamsSnapshot | undefined,
): void {
  if (!snapshot) {
    removeTelegramLaunchParamsSnapshotFromSessionStorage();
    return;
  }

  persistTelegramLaunchParamsSnapshotInSessionStorage(snapshot);
}

function persistTelegramLaunchParamsSnapshotInSessionStorage(
  snapshot: TelegramLaunchParamsSnapshot,
): void {
  if (typeof sessionStorage === 'undefined') {
    throw new Error('Telegram launch params sessionStorage is unavailable.');
  }

  try {
    sessionStorage.setItem(TELEGRAM_LAUNCH_PARAMS_STORAGE_KEY, JSON.stringify(snapshot));
  } catch (e: unknown) {
    removeTelegramLaunchParamsSnapshotFromSessionStorage();
    throw new Error('Failed to persist Telegram launch params in sessionStorage.', { cause: e });
  }
}

function readTelegramLaunchParamsSnapshotFromSessionStorage():
  | TelegramLaunchParamsSnapshot
  | undefined {
  if (typeof sessionStorage === 'undefined') {
    return undefined;
  }

  let storedValue: string | null;
  try {
    storedValue = sessionStorage.getItem(TELEGRAM_LAUNCH_PARAMS_STORAGE_KEY);
  } catch (e: unknown) {
    console.error('Failed to read Telegram launch params from sessionStorage.', e);
    return undefined;
  }

  if (storedValue === null) {
    return undefined;
  }

  let parsedValue: unknown;
  try {
    parsedValue = JSON.parse(storedValue);
  } catch (e: unknown) {
    console.error('Failed to parse Telegram launch params from sessionStorage.', e);
    removeTelegramLaunchParamsSnapshotFromSessionStorage();
    return undefined;
  }

  if (!isTelegramLaunchParamsSnapshot(parsedValue)) {
    console.error('Invalid Telegram launch params snapshot in sessionStorage.');
    removeTelegramLaunchParamsSnapshotFromSessionStorage();
    return undefined;
  }

  return parsedValue;
}

function removeTelegramLaunchParamsSnapshotFromSessionStorage(): void {
  if (typeof sessionStorage === 'undefined') {
    return;
  }

  try {
    sessionStorage.removeItem(TELEGRAM_LAUNCH_PARAMS_STORAGE_KEY);
  } catch (e: unknown) {
    console.error('Failed to remove Telegram launch params from sessionStorage.', e);
  }
}

function isTelegramLaunchParamsSnapshot(value: unknown): value is TelegramLaunchParamsSnapshot {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const hasInitData = 'initData' in value;
  const hasStartParam = 'startParam' in value;
  if (!hasInitData && !hasStartParam) {
    return false;
  }

  if (hasInitData && (typeof value.initData !== 'string' || value.initData.length === 0)) {
    return false;
  }

  if (hasStartParam && (typeof value.startParam !== 'string' || value.startParam.length === 0)) {
    return false;
  }

  return Object.keys(value).every((key) => key === 'initData' || key === 'startParam');
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
