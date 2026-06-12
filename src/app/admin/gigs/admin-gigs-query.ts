import { GigStatus, isGigStatus } from '@/app/admin/gigs/types';
import {
  AdminGigsSortBy,
  AdminGigsSortOrder,
  parseAdminGigsSortByFromQuery,
  parseAdminGigsSortOrderFromQuery,
} from '@/app/admin/gigs/admin-gigs-sort';
import { GIG_FORM_ADMIN_BASE_PATH } from '@/app/gig-form/gig-form-paths';

export const ADMIN_GIGS_QUERY_STATUS = 'status';
export const ADMIN_GIGS_QUERY_GIG = 'gig';
export const ADMIN_GIGS_QUERY_SORT_BY = 'sortBy';
export const ADMIN_GIGS_QUERY_SORT_ORDER = 'sortOrder';
export const ADMIN_GIGS_QUERY_EDIT = 'edit';

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
  readonly isEditing: boolean;
}

function parseIsEditingFromQuery(value: string | null): boolean {
  return value === '1' || value === 'true';
}

export function readAdminGigsQueryState(
  searchParams: Pick<URLSearchParams, 'get'>,
): AdminGigsQueryState {
  const filter = parseGigStatusFromQuery(searchParams.get(ADMIN_GIGS_QUERY_STATUS));
  const gigRaw = searchParams.get(ADMIN_GIGS_QUERY_GIG);
  const selectedGigPublicId = gigRaw?.trim() ? gigRaw.trim() : null;
  const sortBy = parseAdminGigsSortByFromQuery(searchParams.get(ADMIN_GIGS_QUERY_SORT_BY), filter);
  const sortOrder = parseAdminGigsSortOrderFromQuery(searchParams.get(ADMIN_GIGS_QUERY_SORT_ORDER));
  const isEditing = parseIsEditingFromQuery(searchParams.get(ADMIN_GIGS_QUERY_EDIT));
  return { filter, selectedGigPublicId, sortBy, sortOrder, isEditing };
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
  if (params.isEditing) {
    next.set(ADMIN_GIGS_QUERY_EDIT, '1');
  }
  return next;
}

export function buildAdminGigsPath(params: AdminGigsQueryState): string {
  const search = buildAdminGigsSearchParams(params);
  const query = search.toString();
  return query ? `${GIG_FORM_ADMIN_BASE_PATH}?${query}` : GIG_FORM_ADMIN_BASE_PATH;
}

export function buildAdminGigEditHref(
  publicId: string,
  partial?: Partial<Omit<AdminGigsQueryState, 'selectedGigPublicId' | 'isEditing'>>,
): string {
  const trimmedId = publicId.trim();
  if (!trimmedId) {
    throw new Error('publicId is required');
  }

  const filter = partial?.filter ?? GigStatus.Pending;

  return buildAdminGigsPath({
    filter,
    selectedGigPublicId: trimmedId,
    sortBy: partial?.sortBy ?? AdminGigsSortBy.CreatedAt,
    sortOrder: partial?.sortOrder ?? AdminGigsSortOrder.Desc,
    isEditing: true,
  });
}
