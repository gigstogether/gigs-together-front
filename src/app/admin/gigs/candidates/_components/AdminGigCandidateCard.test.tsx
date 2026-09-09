// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import type {
  rejectAdminGigCandidate,
  sendAdminGigCandidateToModeration,
} from '@/app/admin/_lib/admin-api';
import AdminGigCandidateCard from '@/app/admin/gigs/candidates/_components/AdminGigCandidateCard';
import type { AdminGigCandidate } from '@/app/admin/gigs/candidates/_lib/admin-gig-candidate';
import { GigCandidateStatusAPI } from '@/app/admin/gigs/candidates/_lib/admin-gig-candidate';
import { createQueryClientWrapper, createTestQueryClient } from '@/test/react-query-client';

const { rejectGigCandidateMock, sendGigCandidateToModerationMock, toastMock } = vi.hoisted(() => ({
  rejectGigCandidateMock: vi.fn<typeof rejectAdminGigCandidate>(),
  sendGigCandidateToModerationMock: vi.fn<typeof sendAdminGigCandidateToModeration>(),
  toastMock: vi.fn(),
}));

vi.mock('@/app/admin/_lib/admin-api', () => ({
  rejectAdminGigCandidate: rejectGigCandidateMock,
  sendAdminGigCandidateToModeration: sendGigCandidateToModerationMock,
}));
vi.mock('@/hooks/use-toast', () => ({ toast: toastMock }));

const gigCandidate: AdminGigCandidate = {
  id: '507f1f77bcf86cd799439099',
  source: {
    type: 'user',
    userId: '42',
    displayName: 'Test User',
    isCurrentlyAdmin: true,
    telegramUsername: 'test_user',
    origin: { type: 'admin' },
  },
  gigDraft: {
    title: 'Band',
    date: '2026-08-20',
    city: 'Barcelona',
    country: 'ES',
    venue: 'Razzmatazz',
  },
  status: GigCandidateStatusAPI.Approved,
  version: 3,
  intakePostUrl: 'https://t.me/c/123/77',
  moderationPostUrl: 'https://t.me/c/124/78',
  linkedGigPublicId: 'band-2026-08-20',
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-02T10:00:00.000Z',
};

function renderCard(gigCandidateToRender: AdminGigCandidate = gigCandidate) {
  return render(<AdminGigCandidateCard gigCandidate={gigCandidateToRender} />, {
    wrapper: createQueryClientWrapper(createTestQueryClient()),
  });
}

describe('AdminGigCandidateCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show Gig Candidate post and linked gig links', () => {
    renderCard();

    expect(screen.getByRole('link', { name: 'Intake post' })).toHaveAttribute(
      'href',
      gigCandidate.intakePostUrl,
    );
    expect(screen.getByRole('link', { name: 'Moderation post' })).toHaveAttribute(
      'href',
      gigCandidate.moderationPostUrl,
    );
    expect(screen.getByRole('link', { name: 'Open linked gig in admin' })).toHaveAttribute(
      'href',
      '/admin/gigs/band-2026-08-20',
    );
    expect(
      screen.getByText('Source: user · Test User (currently admin) · TG: @test_user'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/42/)).not.toBeInTheDocument();
    expect(screen.queryByText('No intake post linked.')).not.toBeInTheDocument();
  });

  it('should render no actions on a terminal preview', () => {
    renderCard();

    expect(screen.queryByRole('link', { name: 'Open' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument();
  });

  it('should show Reject on a Reviewing detail view', () => {
    renderCard({ ...gigCandidate, status: GigCandidateStatusAPI.Reviewing });

    expect(screen.queryByRole('link', { name: 'Open' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Edit' })).toBeInTheDocument();
  });

  it('should render an empty messenger gigDraft safely', () => {
    renderCard({
      ...gigCandidate,
      source: {
        type: 'user',
        userId: 'user-7',
        isCurrentlyAdmin: false,
        origin: {
          type: 'messenger',
          messenger: 'Telegram',
        },
        originalText: 'Unstructured submission',
      },
      gigDraft: {},
      status: GigCandidateStatusAPI.New,
    });

    expect(screen.getByText('Untitled Gig Candidate')).toBeInTheDocument();
    expect(screen.queryByText('Invalid Date')).not.toBeInTheDocument();
    expect(screen.getByText('Source: user')).toBeInTheDocument();
    expect(screen.queryByText(/user-7/)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Open' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send to moderation' })).toBeInTheDocument();
  });

  it('should warn when an expected Intake post is not linked', () => {
    renderCard({
      ...gigCandidate,
      source: {
        type: 'user',
        userId: 'user-7',
        isCurrentlyAdmin: false,
        origin: { type: 'form' },
      },
      intakePostUrl: undefined,
    });

    expect(screen.getByText('No intake post linked.')).toBeInTheDocument();
  });

  it('should not warn about Intake for an admin-origin Gig Candidate', () => {
    renderCard({ ...gigCandidate, intakePostUrl: undefined });

    expect(screen.queryByText('No intake post linked.')).not.toBeInTheDocument();
  });

  it('should show Edit and reject a Reviewing Gig Candidate with its loaded version', async () => {
    const reviewingGigCandidate = {
      ...gigCandidate,
      status: GigCandidateStatusAPI.Reviewing,
    };
    rejectGigCandidateMock.mockResolvedValueOnce({
      ...reviewingGigCandidate,
      status: GigCandidateStatusAPI.Rejected,
      version: 4,
    });
    renderCard(reviewingGigCandidate);

    expect(screen.getByRole('link', { name: 'Edit' })).toHaveAttribute(
      'href',
      `/admin/gigs/candidates/${gigCandidate.id}/edit`,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Reject' }));

    await waitFor(() => {
      expect(rejectGigCandidateMock).toHaveBeenCalledWith({
        gigCandidateId: gigCandidate.id,
        expectedVersion: gigCandidate.version,
      });
    });
    expect(toastMock).toHaveBeenCalledWith({ title: 'Gig Candidate rejected' });
  });
});
