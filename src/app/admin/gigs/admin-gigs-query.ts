import type { GigStatusFilter } from '@/app/admin/gigs/types';
import {
  parseAdminGigsSortByFromQuery,
  parseAdminGigsSortOrderFromQuery,
} from '@/app/admin/gigs/admin-gigs-sort';
import type { AdminGigsSortBy, AdminGigsSortOrder } from '@/app/admin/gigs/admin-gigs-sort';
import { parseGigStatusFilterFromQuery } from '@/app/admin/gigs/admin-gig-status';

export const ADMIN_GIGS_QUERY_STATUS = 'status';
export const ADMIN_GIGS_QUERY_GIG = 'gig';
export const ADMIN_GIGS_QUERY_SORT_BY = 'sortBy';
export const ADMIN_GIGS_QUERY_SORT_ORDER = 'sortOrder';

export interface AdminGigsQueryState {
  readonly filter: GigStatusFilter;
  readonly selectedGigPublicId: string | null;
  readonly sortBy: AdminGigsSortBy;
  readonly sortOrder: AdminGigsSortOrder;
}

export function getAdminGigsQueryStateOrDefaults(
  searchParams: Pick<URLSearchParams, 'get'>,
): AdminGigsQueryState {
  const filter = parseGigStatusFilterFromQuery(searchParams.get(ADMIN_GIGS_QUERY_STATUS));
  const sortBy = parseAdminGigsSortByFromQuery(searchParams.get(ADMIN_GIGS_QUERY_SORT_BY));
  const sortOrder = parseAdminGigsSortOrderFromQuery(searchParams.get(ADMIN_GIGS_QUERY_SORT_ORDER));
  const selectedGigPublicId = searchParams.get(ADMIN_GIGS_QUERY_GIG)?.trim() || null;
  return {
    filter,
    sortBy,
    sortOrder,
    selectedGigPublicId,
  };
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
