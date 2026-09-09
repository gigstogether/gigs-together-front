import {
  GigCandidateStatusFilter,
  GigCandidateStatusAPI,
} from '@/app/admin/gigs/candidates/_lib/admin-gig-candidate';

export const GIG_CANDIDATE_STATUS_FILTERS: readonly GigCandidateStatusFilter[] = [
  GigCandidateStatusFilter.New,
  GigCandidateStatusFilter.Reviewing,
  GigCandidateStatusFilter.Approved,
  GigCandidateStatusFilter.Rejected,
];

export const GIG_CANDIDATE_STATUS_LABELS: Record<GigCandidateStatusFilter, string> = {
  [GigCandidateStatusFilter.New]: 'New',
  [GigCandidateStatusFilter.Reviewing]: 'Rev',
  [GigCandidateStatusFilter.Approved]: 'Approved',
  [GigCandidateStatusFilter.Rejected]: 'Rejected',
};

export const GIG_CANDIDATE_EMPTY_MESSAGES: Record<GigCandidateStatusFilter, string> = {
  [GigCandidateStatusFilter.New]: 'No new Gig Candidates.',
  [GigCandidateStatusFilter.Reviewing]: 'No reviewing Gig Candidates.',
  [GigCandidateStatusFilter.Approved]: 'No approved Gig Candidates.',
  [GigCandidateStatusFilter.Rejected]: 'No rejected Gig Candidates.',
};

export const GIG_CANDIDATE_STATUS_DOT_CLASS_NAMES: Record<GigCandidateStatusAPI, string> = {
  [GigCandidateStatusAPI.New]: 'bg-slate-500',
  [GigCandidateStatusAPI.Reviewing]: 'bg-yellow-500',
  [GigCandidateStatusAPI.Approved]: 'bg-emerald-500',
  [GigCandidateStatusAPI.Rejected]: 'bg-rose-500',
};

export const GIG_CANDIDATE_STATUS_FILTER_BY_API: Record<
  GigCandidateStatusAPI,
  GigCandidateStatusFilter
> = {
  [GigCandidateStatusAPI.New]: GigCandidateStatusFilter.New,
  [GigCandidateStatusAPI.Reviewing]: GigCandidateStatusFilter.Reviewing,
  [GigCandidateStatusAPI.Approved]: GigCandidateStatusFilter.Approved,
  [GigCandidateStatusAPI.Rejected]: GigCandidateStatusFilter.Rejected,
};

function isGigCandidateStatusFilter(value: string): value is GigCandidateStatusFilter {
  return GIG_CANDIDATE_STATUS_FILTERS.some((gigCandidateStatus) => gigCandidateStatus === value);
}

export function parseGigCandidateStatusFilter(value: string | null): GigCandidateStatusFilter {
  if (value && isGigCandidateStatusFilter(value)) {
    return value;
  }
  return GigCandidateStatusFilter.New;
}
