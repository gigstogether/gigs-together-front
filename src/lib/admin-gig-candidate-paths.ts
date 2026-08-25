import type { Route } from 'next';

export const ADMIN_GIG_CANDIDATES_BASE_PATH = '/admin/gigs/candidates';
export const ADMIN_GIG_CANDIDATES_ROUTE: Route<'/admin/gigs/candidates'> =
  ADMIN_GIG_CANDIDATES_BASE_PATH;

export type AdminGigCandidatePath = `/admin/gigs/candidates/${string}`;
export type AdminGigCandidateEditPath = `/admin/gigs/candidates/${string}/edit`;

export function buildAdminGigCandidatePath(gigCandidateId: string): AdminGigCandidatePath {
  const id = gigCandidateId.trim();
  if (!id) {
    throw new Error('gigCandidateId is required');
  }
  return `${ADMIN_GIG_CANDIDATES_BASE_PATH}/${encodeURIComponent(id)}`;
}

export function buildAdminGigCandidateRoute(gigCandidateId: string): Route {
  // Next Route does not accept encoded dynamic route strings without a localized assertion.
  return buildAdminGigCandidatePath(gigCandidateId) as Route;
}

export function buildAdminGigCandidateEditPath(gigCandidateId: string): AdminGigCandidateEditPath {
  return `${buildAdminGigCandidatePath(gigCandidateId)}/edit`;
}

export function buildAdminGigCandidateEditRoute(gigCandidateId: string): Route {
  // Next Route does not accept encoded dynamic route strings without a localized assertion.
  return buildAdminGigCandidateEditPath(gigCandidateId) as Route;
}

export const ADMIN_GIG_CANDIDATE_NEW_ROUTE: Route<'/admin/gigs/candidates/new'> =
  '/admin/gigs/candidates/new';
