import type {
  AdminGigCandidatesSortBy,
  AdminGigCandidatesSortOrder,
  GigCandidateStatusFilter,
} from '@/app/admin/gig-candidates/_lib/admin-gig-candidate';
import {
  parseAdminGigCandidatesSortBy,
  parseAdminGigCandidatesSortOrder,
} from '@/app/admin/gig-candidates/_lib/admin-gig-candidate';
import { parseGigCandidateStatusFilter } from '@/app/admin/gig-candidates/_lib/admin-gig-candidate-status';

export interface AdminGigCandidatesQueryState {
  filter: GigCandidateStatusFilter;
  selectedGigCandidateId: string | null;
  sortBy: AdminGigCandidatesSortBy;
  sortOrder: AdminGigCandidatesSortOrder;
}

export function getAdminGigCandidatesQueryStateOrDefaults(
  searchParams: Pick<URLSearchParams, 'get'>,
): AdminGigCandidatesQueryState {
  return {
    filter: parseGigCandidateStatusFilter(searchParams.get('status')),
    selectedGigCandidateId: searchParams.get('gigCandidate')?.trim() || null,
    sortBy: parseAdminGigCandidatesSortBy(searchParams.get('sortBy')),
    sortOrder: parseAdminGigCandidatesSortOrder(searchParams.get('sortOrder')),
  };
}

export function buildAdminGigCandidatesSearchParams(
  state: AdminGigCandidatesQueryState,
): URLSearchParams {
  const params = new URLSearchParams();
  params.set('status', state.filter);
  params.set('sortBy', state.sortBy);
  params.set('sortOrder', state.sortOrder);
  const gigCandidateId = state.selectedGigCandidateId?.trim();
  if (gigCandidateId) {
    params.set('gigCandidate', gigCandidateId);
  }
  return params;
}
