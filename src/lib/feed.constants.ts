const DEFAULT_FEED_PAGE_SIZE = 10;
const DEFAULT_FEED_CALENDAR_DATES_STALE_TIME_MS = 600_000; // 10 minutes

const parseOptionalPositiveInt = (raw: string | undefined, name: string): number | undefined => {
  if (raw === undefined || raw === null || raw.trim() === '') return undefined;

  const n = Number(raw);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
    throw new Error(`${name} must be a positive integer (got "${raw}")`);
  }

  return n;
};

export const FEED_PAGE_SIZE =
  parseOptionalPositiveInt(process.env.NEXT_PUBLIC_FEED_PAGE_SIZE, 'NEXT_PUBLIC_FEED_PAGE_SIZE') ??
  DEFAULT_FEED_PAGE_SIZE;

export const FEED_CALENDAR_DATES_STALE_TIME_MS =
  parseOptionalPositiveInt(
    process.env.NEXT_PUBLIC_FEED_CALENDAR_DATES_STALE_TIME_MS,
    'NEXT_PUBLIC_FEED_CALENDAR_DATES_STALE_TIME_MS',
  ) ?? DEFAULT_FEED_CALENDAR_DATES_STALE_TIME_MS;
