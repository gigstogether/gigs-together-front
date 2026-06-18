import type { Route } from 'next';

export const ADMIN_GIGS_BASE_PATH = '/admin/gigs';
export const ADMIN_GIGS_ROUTE: Route<'/admin/gigs'> = ADMIN_GIGS_BASE_PATH;
export const ADMIN_GIGS_NEW_PATH = '/admin/gigs/new';
export const ADMIN_GIGS_NEW_ROUTE: Route<'/admin/gigs/new'> = ADMIN_GIGS_NEW_PATH;

export type AdminGigPublicIdPath = `/admin/gigs/${string}`;
export type AdminGigEditPath = `/admin/gigs/${string}/edit`;
// export type AdminGigsPath = '/admin/gigs' | `/admin/gigs?${string}`;

export function buildAdminGigPublicIdPath(publicId: string): AdminGigPublicIdPath {
  const trimmedId = publicId.trim();
  if (!trimmedId) {
    throw new Error('publicId is required');
  }
  return `${ADMIN_GIGS_BASE_PATH}/${encodeURIComponent(trimmedId)}`;
}

export function buildAdminGigEditPath(publicId: string): AdminGigEditPath {
  return `${buildAdminGigPublicIdPath(publicId)}/edit`;
}

// Next Route does not accept encoded dynamic route strings without a localized assertion.
export function buildAdminGigPublicIdRoute(publicId: string): Route {
  const route: Route = buildAdminGigPublicIdPath(publicId) as Route;
  return route;
}

export function buildAdminGigEditRoute(publicId: string): Route {
  const route: Route = buildAdminGigEditPath(publicId) as Route;
  return route;
}

export function buildAdminGigsRoute(search: URLSearchParams | string | undefined): Route {
  const queryString = typeof search === 'string' ? search.trim() : (search?.toString() ?? '');

  if (!queryString) {
    return ADMIN_GIGS_ROUTE;
  }

  const route: Route = `${ADMIN_GIGS_BASE_PATH}?${queryString}` as Route;
  return route;
}
