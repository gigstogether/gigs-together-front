import type { Route } from 'next';

export interface FeedLocation {
  country: string;
  communitySlug: string;
}

export interface FeedHeaderHomeLocation {
  country: string;
  communitySlug?: string;
}

// NOTE: Next "typed routes" expect `redirect()` / `href` arguments to be a `Route`.
// We centralize the minimal type assertion here to avoid sprinkling `as Route` across pages.
export type FeedPath = `/feed/${string}` | `/feed/${string}/${string}`;
export const DEFAULT_FEED_COUNTRY = 'es';
export const DEFAULT_FEED_COMMUNITY_SLUG = 'barcelona';

export const normalizeSegment = (value: string): string =>
  decodeURIComponent(value).trim().toLowerCase();

export const buildFeedPath = (loc: FeedLocation): FeedPath => {
  const country = normalizeSegment(loc.country);
  const communitySlug = normalizeSegment(loc.communitySlug);
  return `/feed/${encodeURIComponent(country)}/${encodeURIComponent(communitySlug)}`;
};

function buildFeedCountryPath(country: string): FeedPath {
  const normalizedCountry = normalizeSegment(country);
  return `/feed/${encodeURIComponent(normalizedCountry)}`;
}

export function buildFeedHeaderHomeRoute(location?: FeedHeaderHomeLocation): Route {
  if (!location?.country) {
    return '/';
  }

  if (location.communitySlug) {
    return buildFeedPath({
      country: location.country,
      communitySlug: location.communitySlug,
    }) as Route;
  }

  return buildFeedCountryPath(location.country) as Route;
}

export const DEFAULT_FEED_PATH = `/feed/${DEFAULT_FEED_COUNTRY}/${DEFAULT_FEED_COMMUNITY_SLUG}`;
export const DEFAULT_FEED_ROUTE: Route<'/feed/es/barcelona'> = DEFAULT_FEED_PATH;
