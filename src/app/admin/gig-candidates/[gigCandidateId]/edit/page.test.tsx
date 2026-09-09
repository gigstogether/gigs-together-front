// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';

import AdminGigCandidateEditPage from './page';

vi.mock('@/app/admin/gig-candidates/_components/AdminGigCandidateFormPage', () => ({
  default: (props: { gigCandidateId: string }) => (
    <div>Edit Gig Candidate {props.gigCandidateId}</div>
  ),
}));

describe('AdminGigCandidateEditPage', () => {
  it('should pass the route Gig Candidate id to the shared form page', async () => {
    render(
      await AdminGigCandidateEditPage({
        params: Promise.resolve({ gigCandidateId: 'gigCandidate-42' }),
      }),
    );

    expect(screen.getByText('Edit Gig Candidate gigCandidate-42')).toBeInTheDocument();
  });
});
