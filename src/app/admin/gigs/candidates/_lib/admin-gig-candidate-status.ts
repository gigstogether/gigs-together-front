import {
  GigCandidateStatusFilter,
  GigCandidateStatusAPI,
} from '@/app/admin/gigs/candidates/_lib/admin-gig-candidate';

export const GIG_CANDIDATE_STATUS_FILTERS: readonly GigCandidateStatusFilter[] = [
  GigCandidateStatusFilter.Pending,
  GigCandidateStatusFilter.Reviewing,
  GigCandidateStatusFilter.Approved,
  GigCandidateStatusFilter.Rejected,
];

export const GIG_CANDIDATE_STATUS_LABELS: Record<GigCandidateStatusFilter, string> = {
  [GigCandidateStatusFilter.Pending]: 'Pending',
  [GigCandidateStatusFilter.Reviewing]: 'Reviewing',
  [GigCandidateStatusFilter.Approved]: 'Approved',
  [GigCandidateStatusFilter.Rejected]: 'Rejected',
};

export const GIG_CANDIDATE_EMPTY_MESSAGES: Record<GigCandidateStatusFilter, string> = {
  [GigCandidateStatusFilter.Pending]: 'No pending Gig Candidates.',
  [GigCandidateStatusFilter.Reviewing]: 'No reviewing Gig Candidates.',
  [GigCandidateStatusFilter.Approved]: 'No approved Gig Candidates.',
  [GigCandidateStatusFilter.Rejected]: 'No rejected Gig Candidates.',
};

export const GIG_CANDIDATE_STATUS_DOT_CLASS_NAMES: Record<GigCandidateStatusAPI, string> = {
  [GigCandidateStatusAPI.Pending]: 'bg-slate-500',
  [GigCandidateStatusAPI.Reviewing]: 'bg-yellow-500',
  [GigCandidateStatusAPI.Approved]: 'bg-emerald-500',
  [GigCandidateStatusAPI.Rejected]: 'bg-rose-500',
};

function isGigCandidateStatusFilter(value: string): value is GigCandidateStatusFilter {
  return GIG_CANDIDATE_STATUS_FILTERS.some((gigCandidateStatus) => gigCandidateStatus === value);
}

export function parseGigCandidateStatusFilter(value: string | null): GigCandidateStatusFilter {
  if (value && isGigCandidateStatusFilter(value)) {
    return value;
  }
  return GigCandidateStatusFilter.Pending;
}
