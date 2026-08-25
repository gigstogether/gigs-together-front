// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';

import AdminGigCandidateBackLink from '@/app/admin/gigs/candidates/_components/AdminGigCandidateBackLink';

describe('AdminGigCandidateBackLink', () => {
  it('should link to the Gig Candidate list', () => {
    render(<AdminGigCandidateBackLink />);

    expect(screen.getByRole('link', { name: /Gig Candidates/ })).toHaveAttribute(
      'href',
      '/admin/gigs/candidates',
    );
  });
});
