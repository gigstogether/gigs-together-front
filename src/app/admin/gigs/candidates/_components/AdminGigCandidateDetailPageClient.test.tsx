// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';

import type { fetchAdminGigCandidateById } from '@/app/admin/_lib/admin-api';
import AdminGigCandidateDetailPageClient from '@/app/admin/gigs/candidates/_components/AdminGigCandidateDetailPageClient';
import type { AdminGigCandidate } from '@/app/admin/gigs/candidates/_lib/admin-gig-candidate';
import { GigCandidateStatusAPI } from '@/app/admin/gigs/candidates/_lib/admin-gig-candidate';
import { createQueryClientWrapper, createTestQueryClient } from '@/test/react-query-client';

const { fetchGigCandidateMock } = vi.hoisted(() => ({
  fetchGigCandidateMock: vi.fn<typeof fetchAdminGigCandidateById>(),
}));

vi.mock('@/app/admin/_lib/admin-api', () => ({
  fetchAdminGigCandidateById: fetchGigCandidateMock,
}));
vi.mock('@/app/admin/gigs/candidates/_components/AdminGigCandidateDraftForm', () => ({
  default: () => <div data-testid="gigCandidate-draft-form" />,
}));
vi.mock('@/app/admin/gigs/candidates/_components/AdminGigCandidateCard', () => ({
  default: () => <div data-testid="gigCandidate-card" />,
}));

function createGigCandidate(status: GigCandidateStatusAPI): AdminGigCandidate {
  return {
    id: 'gigCandidate-42',
    source: {
      type: 'user',
      userId: 'user-7',
      isCurrentlyAdmin: false,
      origin: { type: 'form' },
      originalText: 'Original submission',
      attachments: [{ bucketPath: 'gigCandidate/poster.jpg' }],
    },
    gigDraft: { title: 'Band' },
    status,
    version: 3,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-02T10:00:00.000Z',
  };
}

function renderView(status: GigCandidateStatusAPI) {
  fetchGigCandidateMock.mockResolvedValueOnce(createGigCandidate(status));
  return render(
    <AdminGigCandidateDetailPageClient
      mode="view"
      gigCandidateId="gigCandidate-42"
    />,
    { wrapper: createQueryClientWrapper(createTestQueryClient()) },
  );
}

function renderEdit(status: GigCandidateStatusAPI) {
  fetchGigCandidateMock.mockResolvedValueOnce(createGigCandidate(status));
  return render(
    <AdminGigCandidateDetailPageClient
      mode="edit"
      countries={[{ iso: 'ES' }]}
      gigCandidateId="gigCandidate-42"
    />,
    { wrapper: createQueryClientWrapper(createTestQueryClient()) },
  );
}

describe('AdminGigCandidateDetailPageClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the card with its actions on the view page', async () => {
    renderView(GigCandidateStatusAPI.Reviewing);

    expect(await screen.findByTestId('gigCandidate-card')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Gig Candidates/ })).toHaveAttribute(
      'href',
      '/admin/gigs/candidates?status=reviewing',
    );
    expect(screen.queryByTestId('gigCandidate-draft-form')).not.toBeInTheDocument();
  });

  it('should show the edit form without source data or a reject action when Reviewing', async () => {
    renderEdit(GigCandidateStatusAPI.Reviewing);

    expect(await screen.findByTestId('gigCandidate-draft-form')).toBeInTheDocument();
    expect(screen.queryByText('Original submission')).not.toBeInTheDocument();
    expect(screen.queryByText(/gigCandidate\/poster.jpg/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument();
    expect(screen.queryByTestId('gigCandidate-card')).not.toBeInTheDocument();
  });

  it('should reject the edit route when status is terminal', async () => {
    renderEdit(GigCandidateStatusAPI.Approved);

    expect(
      await screen.findByText('Only Reviewing Gig Candidates can be edited.'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('gigCandidate-card')).not.toBeInTheDocument();
    expect(screen.queryByTestId('gigCandidate-draft-form')).not.toBeInTheDocument();
  });
});
