import {
  ADMIN_GIG_CANDIDATES_ROUTE,
  ADMIN_GIG_CANDIDATE_NEW_ROUTE,
  buildAdminGigCandidateEditRoute,
  buildAdminGigCandidatePath,
  buildAdminGigCandidateRoute,
} from '@/lib/admin-gig-candidate-paths';

describe('admin gig candidate paths', () => {
  it('should expose the GigCandidate collection and create routes', () => {
    expect(ADMIN_GIG_CANDIDATES_ROUTE).toBe('/admin/gigs/candidates');
    expect(ADMIN_GIG_CANDIDATE_NEW_ROUTE).toBe('/admin/gigs/candidates/new');
  });

  it('should build an encoded GigCandidate detail route', () => {
    expect(buildAdminGigCandidateRoute('gigCandidate/id')).toBe(
      '/admin/gigs/candidates/gigCandidate%2Fid',
    );
  });

  it('should build an encoded GigCandidate edit route', () => {
    expect(buildAdminGigCandidateEditRoute('gigCandidate/id')).toBe(
      '/admin/gigs/candidates/gigCandidate%2Fid/edit',
    );
  });

  it('should throw when GigCandidate id is empty', () => {
    expect(() => buildAdminGigCandidatePath('   ')).toThrow('gigCandidateId is required');
  });
});
