import {
  GIG_CANDIDATE_STATUS_DOT_CLASS_NAMES,
  GIG_CANDIDATE_STATUS_FILTERS,
  parseGigCandidateStatusFilter,
} from '@/app/admin/gig-candidates/_lib/admin-gig-candidate-status';
import {
  GigCandidateStatusAPI,
  GigCandidateStatusFilter,
} from '@/app/admin/gig-candidates/_lib/admin-gig-candidate';

describe('parseGigCandidateStatusFilter', () => {
  it('should expose every GigCandidate workflow status', () => {
    expect(GIG_CANDIDATE_STATUS_FILTERS).toEqual([
      GigCandidateStatusFilter.New,
      GigCandidateStatusFilter.Reviewing,
      GigCandidateStatusFilter.Approved,
      GigCandidateStatusFilter.Rejected,
    ]);
  });

  it.each(GIG_CANDIDATE_STATUS_FILTERS)(
    'should parse the %s GigCandidate status',
    (gigCandidateStatus) => {
      expect(parseGigCandidateStatusFilter(gigCandidateStatus)).toBe(gigCandidateStatus);
    },
  );

  it('should fall back to New when the GigCandidate status is unknown', () => {
    expect(parseGigCandidateStatusFilter('unknown')).toBe(GigCandidateStatusFilter.New);
  });

  it('should use the established gray and yellow colors for New and Reviewing', () => {
    expect(GIG_CANDIDATE_STATUS_DOT_CLASS_NAMES).toEqual({
      [GigCandidateStatusAPI.New]: 'bg-slate-500',
      [GigCandidateStatusAPI.Reviewing]: 'bg-yellow-500',
      [GigCandidateStatusAPI.Approved]: 'bg-emerald-500',
      [GigCandidateStatusAPI.Rejected]: 'bg-rose-500',
    });
  });
});
