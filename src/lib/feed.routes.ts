import type { Route } from 'next';

export interface FeedLocation {
  readonly country: string;
  readonly city: string;
}

export interface FeedHeaderHomeLocation {
  readonly country: string;
  readonly city?: string;
}

// NOTE: Next "typed routes" expect `redirect()` / `href` arguments to be a `Route`.
// We centralize the minimal type assertion here to avoid sprinkling `as Route` across pages.
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

function buildFeedCountryPath(country: string): FeedPath {
  const normalizedCountry = normalizeSegment(country);
  return `/feed/${encodeURIComponent(normalizedCountry)}`;
}

export function buildFeedHeaderHomeRoute(location?: FeedHeaderHomeLocation): Route {
  if (!location?.country) {
    return '/';
  }

  if (location.city) {
    return buildFeedPath({ country: location.country, city: location.city }) as Route;
  }

  return buildFeedCountryPath(location.country) as Route;
}

export const DEFAULT_FEED_PATH = `/feed/${DEFAULT_FEED_COUNTRY}/${DEFAULT_FEED_CITY}`;
export const DEFAULT_FEED_ROUTE: Route<'/feed/es/barcelona'> = DEFAULT_FEED_PATH;
