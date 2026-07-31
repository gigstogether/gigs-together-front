export interface FeedLocation {
  readonly country: string;
  readonly city: string;
}

// NOTE: Next "typed routes" expect `redirect()` arguments to be a `Route`.
// We centralize the minimal type assertion here to avoid sprinkling `as Route` across pages.
import type { Route } from 'next';

export type FeedPath = `/feed/${string}` | `/feed/${string}/${string}`;
const DEFAULT_FEED_COUNTRY = 'es';
const DEFAULT_FEED_CITY = 'barcelona';

export const SUPPORTED_FEED_LOCATIONS: readonly FeedLocation[] = [
  // Currently, we only support one location.
  { country: DEFAULT_FEED_COUNTRY, city: DEFAULT_FEED_CITY },
];

export const normalizeSegment = (value: string): string =>
  decodeURIComponent(value).trim().toLowerCase();

export const buildFeedPath = (loc: FeedLocation): FeedPath => {
  const country = normalizeSegment(loc.country);
  const city = normalizeSegment(loc.city);
  return `/feed/${encodeURIComponent(country)}/${encodeURIComponent(city)}`;
};

export const DEFAULT_FEED_PATH = `/feed/${DEFAULT_FEED_COUNTRY}/${DEFAULT_FEED_CITY}`;
export const DEFAULT_FEED_ROUTE: Route<'/feed/es/barcelona'> = DEFAULT_FEED_PATH;
