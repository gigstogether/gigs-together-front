import { GigStatus, isGigStatus } from '@/app/admin/gigs/types';

export const ADMIN_GIGS_QUERY_STATUS = 'status';
export const ADMIN_GIGS_QUERY_GIG = 'gig';

export function parseGigStatusFromQuery(value: string | null): GigStatus {
  if (value && isGigStatus(value)) {
    return value;
  }
  return GigStatus.Pending;
}

export interface AdminGigsQueryState {
  readonly filter: GigStatus;
  readonly selectedGigPublicId: string | null;
}

export function readAdminGigsQueryState(
  searchParams: Pick<URLSearchParams, 'get'>,
): AdminGigsQueryState {
  const filter = parseGigStatusFromQuery(searchParams.get(ADMIN_GIGS_QUERY_STATUS));
  const gigRaw = searchParams.get(ADMIN_GIGS_QUERY_GIG);
  const selectedGigPublicId = gigRaw?.trim() ? gigRaw.trim() : null;
  return { filter, selectedGigPublicId };
}

export function buildAdminGigsSearchParams(params: AdminGigsQueryState): URLSearchParams {
  const next = new URLSearchParams();
  next.set(ADMIN_GIGS_QUERY_STATUS, params.filter);
  const publicId = params.selectedGigPublicId?.trim();
  if (publicId) {
    next.set(ADMIN_GIGS_QUERY_GIG, publicId);
  }
  return next;
}
