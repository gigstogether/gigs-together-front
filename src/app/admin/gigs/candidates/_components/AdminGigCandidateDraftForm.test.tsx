// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import type {
  createAdminGigCandidate,
  lookupAdminGigCandidateDraft,
  updateAdminGigCandidateDraft,
} from '@/app/admin/_lib/admin-api';
import AdminGigCandidateDraftForm from '@/app/admin/gigs/candidates/_components/AdminGigCandidateDraftForm';
import type { AdminGigCandidate } from '@/app/admin/gigs/candidates/_lib/admin-gig-candidate';
import { GigCandidateStatusAPI } from '@/app/admin/gigs/candidates/_lib/admin-gig-candidate';
import { ApiError } from '@/lib/api-errors';
import { createQueryClientWrapper, createTestQueryClient } from '@/test/react-query-client';

const {
  createGigCandidateMock,
  lookupGigCandidateDraftMock,
  pushMock,
  toastMock,
  updateGigCandidateDraftMock,
} = vi.hoisted(() => ({
  createGigCandidateMock: vi.fn<typeof createAdminGigCandidate>(),
  lookupGigCandidateDraftMock: vi.fn<typeof lookupAdminGigCandidateDraft>(),
  pushMock: vi.fn(),
  toastMock: vi.fn(),
  updateGigCandidateDraftMock: vi.fn<typeof updateAdminGigCandidateDraft>(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));
vi.mock('@/hooks/use-toast', () => ({ toast: toastMock }));
vi.mock('@/app/admin/gigs/_lib/telegram-init-data-expired', () => ({
  toastTelegramInitDataExpired: vi.fn(() => false),
}));
vi.mock('@/app/admin/_lib/admin-api', () => ({
  createAdminGigCandidate: createGigCandidateMock,
  lookupAdminGigCandidateDraft: lookupGigCandidateDraftMock,
  updateAdminGigCandidateDraft: updateGigCandidateDraftMock,
}));

function createReviewingGigCandidate(): AdminGigCandidate {
  return {
    id: 'gigCandidate-42',
    source: {
      type: 'user',
      userId: 'user-7',
      isCurrentlyAdmin: false,
      origin: { type: 'admin' },
    },
    gigDraft: { title: 'Existing Band', city: 'Madrid', country: 'ES' },
    status: GigCandidateStatusAPI.Reviewing,
    version: 4,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-02T10:00:00.000Z',
  };
}

function renderForm(gigCandidate?: AdminGigCandidate) {
  const queryClient = createTestQueryClient();
  return {
    queryClient,
    ...render(
      <AdminGigCandidateDraftForm
        countries={[{ iso: 'ES' }]}
        gigCandidate={gigCandidate}
      />,
      { wrapper: createQueryClientWrapper(queryClient) },
    ),
  };
}

describe('AdminGigCandidateDraftForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should explicitly create a GigCandidate from the editable gigDraft', async () => {
    createGigCandidateMock.mockResolvedValueOnce(createReviewingGigCandidate());
    renderForm();

    fireEvent.change(screen.getByLabelText('Title:'), { target: { value: 'New Band' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Gig Candidate' }));

    await waitFor(() => {
      expect(createGigCandidateMock).toHaveBeenCalledWith({
        gigDraft: { title: 'New Band', city: 'Barcelona', country: 'ES' },
        poster: { file: null, url: '' },
      });
    });
    expect(pushMock).toHaveBeenCalledWith('/admin/gigs/candidates/gigCandidate-42');
  });

  it('should update gigDraft and return to the Gig Candidate view route', async () => {
    const gigCandidate = createReviewingGigCandidate();
    updateGigCandidateDraftMock.mockResolvedValueOnce({ ...gigCandidate, version: 5 });
    renderForm(gigCandidate);

    expect(screen.getByText('Edit Gig Candidate')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Venue:'), { target: { value: 'Sala Apolo' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(updateGigCandidateDraftMock).toHaveBeenCalledWith({
        gigCandidateId: 'gigCandidate-42',
        expectedVersion: 4,
        gigDraft: {
          title: 'Existing Band',
          city: 'Madrid',
          country: 'ES',
          venue: 'Sala Apolo',
        },
        poster: { file: null, url: '' },
      });
    });
    expect(pushMock).toHaveBeenCalledWith('/admin/gigs/candidates/gigCandidate-42');
  });

  it('should report a stale GigCandidate version conflict', async () => {
    updateGigCandidateDraftMock.mockRejectedValueOnce(
      new ApiError('Version conflict', 409, 'GIG_CANDIDATE_CONFLICT'),
    );
    renderForm(createReviewingGigCandidate());

    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith({
        title: 'Gig Candidate changed elsewhere',
        description: 'Reload the latest version before saving again.',
        variant: 'destructive',
      });
    });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('should apply lookup results locally without saving a GigCandidate', async () => {
    lookupGigCandidateDraftMock.mockResolvedValueOnce({
      title: 'Looked-up Band',
      date: '2026-09-20',
      city: 'Madrid',
      country: 'es',
      venue: 'Venue',
    });
    renderForm();

    fireEvent.change(screen.getByLabelText('Title:'), { target: { value: 'Band' } });
    fireEvent.click(screen.getByRole('button', { name: 'Find info with AI' }));

    expect(await screen.findByDisplayValue('Looked-up Band')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2026-09-20')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Madrid')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Venue')).toBeInTheDocument();
    expect(lookupGigCandidateDraftMock).toHaveBeenCalledWith({
      title: 'Band',
      location: 'Barcelona, ES',
    });
    expect(createGigCandidateMock).not.toHaveBeenCalled();
    expect(updateGigCandidateDraftMock).not.toHaveBeenCalled();
  });

  it('should preserve the lookup error behavior when the request fails', async () => {
    lookupGigCandidateDraftMock.mockRejectedValueOnce(new Error('AI unavailable'));
    renderForm();

    fireEvent.change(screen.getByLabelText('Title:'), { target: { value: 'Band' } });
    fireEvent.click(screen.getByRole('button', { name: 'Find info with AI' }));

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to start AI lookup.',
        variant: 'destructive',
      });
    });
    expect(createGigCandidateMock).not.toHaveBeenCalled();
    expect(updateGigCandidateDraftMock).not.toHaveBeenCalled();
  });
});
