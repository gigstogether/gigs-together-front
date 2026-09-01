// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';

import AdminGigCandidatePreviewActions from '@/app/admin/gigs/candidates/_components/AdminGigCandidatePreviewActions';
import type { AdminGigCandidate } from '@/app/admin/gigs/candidates/_lib/admin-gig-candidate';
import { GigCandidateStatusAPI } from '@/app/admin/gigs/candidates/_lib/admin-gig-candidate';

vi.mock('@/app/admin/gigs/candidates/_hooks/use-admin-gig-candidate-actions', () => ({
  useAdminGigCandidateActions: () => ({
    approveGigCandidate: vi.fn(),
    isApproving: false,
    isRejecting: false,
    isSendingToModeration: false,
    rejectGigCandidate: vi.fn(),
    sendGigCandidateToModeration: vi.fn(),
  }),
}));

const gigCandidate: AdminGigCandidate = {
  id: '507f1f77bcf86cd799439099',
  source: { type: 'user', userId: '42', origin: { type: 'form' } },
  gigDraft: {},
  status: GigCandidateStatusAPI.New,
  version: 3,
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z',
};

describe('AdminGigCandidatePreviewActions', () => {
  it('should show Send to moderation and Reject for New', () => {
    render(<AdminGigCandidatePreviewActions gigCandidate={gigCandidate} />);

    expect(screen.getByRole('button', { name: 'Send to moderation' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Edit' })).not.toBeInTheDocument();
  });

  it('should show Edit and Reject for Reviewing', () => {
    render(
      <AdminGigCandidatePreviewActions
        gigCandidate={{ ...gigCandidate, status: GigCandidateStatusAPI.Reviewing }}
      />,
    );

    expect(screen.getByRole('link', { name: 'Edit' })).toHaveAttribute(
      'href',
      `/admin/gigs/candidates/${gigCandidate.id}/edit`,
    );
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
  });

  it('should render no actions for terminal status', () => {
    const { container } = render(
      <AdminGigCandidatePreviewActions
        gigCandidate={{ ...gigCandidate, status: GigCandidateStatusAPI.Approved }}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
