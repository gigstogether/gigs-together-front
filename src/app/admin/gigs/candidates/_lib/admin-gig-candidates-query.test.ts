import {
  AdminGigCandidatesSortBy,
  AdminGigCandidatesSortOrder,
  GigCandidateStatusFilter,
} from '@/app/admin/gigs/candidates/_lib/admin-gig-candidate';
import {
  buildAdminGigCandidatesSearchParams,
  getAdminGigCandidatesQueryStateOrDefaults,
} from '@/app/admin/gigs/candidates/_lib/admin-gig-candidates-query';

describe('getAdminGigCandidatesQueryStateOrDefaults', () => {
  it('should return pending and newest created defaults for invalid values', () => {
    const params = new URLSearchParams('status=unknown&sortBy=postDate&sortOrder=sideways');

    expect(getAdminGigCandidatesQueryStateOrDefaults(params)).toEqual({
      filter: GigCandidateStatusFilter.Pending,
      selectedGigCandidateId: null,
      sortBy: AdminGigCandidatesSortBy.CreatedAt,
      sortOrder: AdminGigCandidatesSortOrder.Desc,
    });
  });

  it('should parse explicit filter sorting and selection', () => {
    const params = new URLSearchParams(
      'status=approved&gigCandidate=gigCandidate-42&sortBy=eventDate&sortOrder=asc',
    );

    expect(getAdminGigCandidatesQueryStateOrDefaults(params)).toEqual({
      filter: GigCandidateStatusFilter.Approved,
      selectedGigCandidateId: 'gigCandidate-42',
      sortBy: AdminGigCandidatesSortBy.EventDate,
      sortOrder: AdminGigCandidatesSortOrder.Asc,
    });
  });
});

describe('buildAdminGigCandidatesSearchParams', () => {
  it('should serialize GigCandidate query state', () => {
    const params = buildAdminGigCandidatesSearchParams({
      filter: GigCandidateStatusFilter.Rejected,
      selectedGigCandidateId: 'gigCandidate-42',
      sortBy: AdminGigCandidatesSortBy.CreatedAt,
      sortOrder: AdminGigCandidatesSortOrder.Desc,
    });

    expect(params.toString()).toBe(
      'status=rejected&sortBy=createdAt&sortOrder=desc&gigCandidate=gigCandidate-42',
    );
  });
});
