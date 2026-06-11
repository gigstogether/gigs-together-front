import { GigStatus, isGigStatus } from '@/app/admin/gigs/types';
import {
  parseAdminGigsSortByFromQuery,
  parseAdminGigsSortOrderFromQuery,
} from '@/app/admin/gigs/admin-gigs-sort';
import type { AdminGigsSortBy, AdminGigsSortOrder } from '@/app/admin/gigs/admin-gigs-sort';

export const ADMIN_GIGS_QUERY_STATUS = 'status';
export const ADMIN_GIGS_QUERY_GIG = 'gig';
export const ADMIN_GIGS_QUERY_SORT_BY = 'sortBy';
export const ADMIN_GIGS_QUERY_SORT_ORDER = 'sortOrder';

export function parseGigStatusFromQuery(value: string | null): GigStatus {
  if (value && isGigStatus(value)) {
    return value;
  }
  return GigStatus.Pending;
}

export interface AdminGigsQueryState {
  readonly filter: GigStatus;
  readonly selectedGigPublicId: string | null;
  readonly sortBy: AdminGigsSortBy;
  readonly sortOrder: AdminGigsSortOrder;
}

export function readAdminGigsQueryState(
  searchParams: Pick<URLSearchParams, 'get'>,
): AdminGigsQueryState {
  const filter = parseGigStatusFromQuery(searchParams.get(ADMIN_GIGS_QUERY_STATUS));
  const gigRaw = searchParams.get(ADMIN_GIGS_QUERY_GIG);
  const selectedGigPublicId = gigRaw?.trim() ? gigRaw.trim() : null;
  const sortBy = parseAdminGigsSortByFromQuery(searchParams.get(ADMIN_GIGS_QUERY_SORT_BY), filter);
  const sortOrder = parseAdminGigsSortOrderFromQuery(searchParams.get(ADMIN_GIGS_QUERY_SORT_ORDER));
  return { filter, selectedGigPublicId, sortBy, sortOrder };
}

export function buildAdminGigsSearchParams(params: AdminGigsQueryState): URLSearchParams {
  const next = new URLSearchParams();
  next.set(ADMIN_GIGS_QUERY_STATUS, params.filter);
  next.set(ADMIN_GIGS_QUERY_SORT_BY, params.sortBy);
  next.set(ADMIN_GIGS_QUERY_SORT_ORDER, params.sortOrder);
  const publicId = params.selectedGigPublicId?.trim();
  if (publicId) {
    next.set(ADMIN_GIGS_QUERY_GIG, publicId);
  }
  return next;
}
