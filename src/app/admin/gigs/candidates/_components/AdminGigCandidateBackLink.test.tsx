// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';

import AdminGigCandidateBackLink from '@/app/admin/gigs/candidates/_components/AdminGigCandidateBackLink';
import { GigCandidateStatusAPI } from '@/app/admin/gigs/candidates/_lib/admin-gig-candidate';

describe('AdminGigCandidateBackLink', () => {
  it('should link to the default Gig Candidate list when status is unavailable', () => {
    render(<AdminGigCandidateBackLink />);

    expect(screen.getByRole('link', { name: /Gig Candidates/ })).toHaveAttribute(
      'href',
      '/admin/gigs/candidates',
    );
  });

  it.each([
    [GigCandidateStatusAPI.New, 'new'],
    [GigCandidateStatusAPI.Reviewing, 'reviewing'],
    [GigCandidateStatusAPI.Approved, 'approved'],
    [GigCandidateStatusAPI.Rejected, 'rejected'],
  ])('should link to the %s Gig Candidate list', (gigCandidateStatus, statusFilter) => {
    render(<AdminGigCandidateBackLink gigCandidateStatus={gigCandidateStatus} />);

    expect(screen.getByRole('link', { name: /Gig Candidates/ })).toHaveAttribute(
      'href',
      `/admin/gigs/candidates?status=${statusFilter}`,
    );
  });
});
