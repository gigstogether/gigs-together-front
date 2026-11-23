// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import type {
  createAdminGigCandidate,
  lookupAdminGigCandidateDraft,
  updateAdminGigCandidateDraft,
} from '@/app/admin/_lib/admin-api';
import type {
  fetchAdminLocalities,
  fetchAdminVenues,
} from '@/app/admin/locations/_lib/admin-locations-api';
import AdminGigCandidateDraftForm from '@/app/admin/gig-candidates/_components/AdminGigCandidateDraftForm';
import type { AdminGigCandidate } from '@/app/admin/gig-candidates/_lib/admin-gig-candidate';
import { GigCandidateStatusAPI } from '@/app/admin/gig-candidates/_lib/admin-gig-candidate';
import { ApiError } from '@/lib/api-errors';
import { createQueryClientWrapper, createTestQueryClient } from '@/test/react-query-client';

const {
  createGigCandidateMock,
  fetchLocalitiesMock,
  fetchVenuesMock,
  lookupGigCandidateDraftMock,
  pushMock,
  toastMock,
  updateGigCandidateDraftMock,
} = vi.hoisted(() => ({
  createGigCandidateMock: vi.fn<typeof createAdminGigCandidate>(),
  fetchLocalitiesMock: vi.fn<typeof fetchAdminLocalities>(),
  fetchVenuesMock: vi.fn<typeof fetchAdminVenues>(),
  lookupGigCandidateDraftMock: vi.fn<typeof lookupAdminGigCandidateDraft>(),
  pushMock: vi.fn(),
  toastMock: vi.fn(),
  updateGigCandidateDraftMock: vi.fn<typeof updateAdminGigCandidateDraft>(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));
vi.mock('@/hooks/use-toast', () => ({ toast: toastMock }));
vi.mock('@/app/admin/_lib/admin-api', () => ({
  createAdminGigCandidate: createGigCandidateMock,
  lookupAdminGigCandidateDraft: lookupGigCandidateDraftMock,
  updateAdminGigCandidateDraft: updateGigCandidateDraftMock,
}));
vi.mock('@/app/admin/locations/_lib/admin-locations-api', () => ({
  fetchAdminLocalities: fetchLocalitiesMock,
  fetchAdminVenues: fetchVenuesMock,
}));

const BARCELONA_LOCALITY_ID = '507f1f77bcf86cd799439011';
const SALA_APOLO_VENUE_ID = '507f1f77bcf86cd799439012';

function createReviewingGigCandidate(): AdminGigCandidate {
  return {
    id: 'gigCandidate-42',
    source: {
      type: 'user',
      userId: 'user-7',
      isCurrentlyAdmin: false,
      origin: { type: 'admin' },
    },
    locality: {
      id: BARCELONA_LOCALITY_ID,
      countryIso: 'ES',
      name: 'Barcelona',
    },
    gigDraft: {
      communityIds: ['existing-community-id'],
      title: 'Existing Band',
    },
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
        communityOptions={[{ value: 'existing-community-id', label: 'Barcelona' }]}
        countries={[{ iso: 'ES', name: 'Spain' }]}
        gigCandidate={gigCandidate}
      />,
      { wrapper: createQueryClientWrapper(queryClient) },
    ),
  };
}

async function selectOption(selectName: RegExp, optionName: string): Promise<void> {
  const select = screen.getByRole('combobox', { name: selectName });
  await waitFor(() => expect(select).not.toBeDisabled());
  fireEvent.click(select);
  fireEvent.click(await screen.findByRole('option', { name: optionName }));
}

describe('AdminGigCandidateDraftForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchLocalitiesMock.mockResolvedValue([
      {
        id: BARCELONA_LOCALITY_ID,
        countryIso: 'ES',
        name: 'Barcelona',
        aliases: [],
        timeZone: 'Europe/Madrid',
      },
    ]);
    fetchVenuesMock.mockResolvedValue([
      {
        id: SALA_APOLO_VENUE_ID,
        localityId: BARCELONA_LOCALITY_ID,
        name: 'Sala Apolo',
        aliases: [],
        isActive: true,
      },
    ]);
  });

  it('should create a GigCandidate with its Community and Locality', async () => {
    createGigCandidateMock.mockResolvedValueOnce(createReviewingGigCandidate());
    renderForm();

    fireEvent.change(screen.getByLabelText('Title:*'), { target: { value: 'New Band' } });
    fireEvent.change(screen.getByLabelText('Date:*'), { target: { value: '2026-09-30' } });
    await selectOption(/Locality/, 'Barcelona');
    fireEvent.click(screen.getByRole('button', { name: 'Create Gig Candidate' }));

    await waitFor(() => {
      expect(createGigCandidateMock).toHaveBeenCalledWith({
        localityId: BARCELONA_LOCALITY_ID,
        gigDraft: {
          communityIds: ['existing-community-id'],
          title: 'New Band',
          date: '2026-09-30',
        },
        poster: { file: null, url: '' },
      });
    });
    expect(pushMock).toHaveBeenCalledWith('/admin/gig-candidates/gigCandidate-42');
  });

  it('should update a GigCandidate with multiple Venue assignments', async () => {
    const gigCandidate = createReviewingGigCandidate();
    updateGigCandidateDraftMock.mockResolvedValueOnce({ ...gigCandidate, version: 5 });
    renderForm(gigCandidate);

    expect(screen.getByText('Edit Gig Candidate')).toBeInTheDocument();
    await selectOption(/Venues/, 'Sala Apolo');
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(updateGigCandidateDraftMock).toHaveBeenCalledWith({
        gigCandidateId: 'gigCandidate-42',
        expectedVersion: 4,
        localityId: BARCELONA_LOCALITY_ID,
        gigDraft: {
          communityIds: ['existing-community-id'],
          venueIds: [SALA_APOLO_VENUE_ID],
          title: 'Existing Band',
        },
        poster: { file: null, url: '' },
      });
    });
    expect(pushMock).toHaveBeenCalledWith('/admin/gig-candidates/gigCandidate-42');
  });

  it('should show the original message in edit mode when it is available', () => {
    const gigCandidate = createReviewingGigCandidate();
    gigCandidate.originalMessage = {
      text: 'Unstructured submission',
      url: 'https://t.me/c/123/42',
    };

    renderForm(gigCandidate);

    const originalMessage = screen.getByRole('region', { name: 'Original message' });
    expect(originalMessage).toHaveTextContent('Unstructured submission');
    expect(screen.getByRole('link', { name: 'Open original message in Telegram' })).toHaveAttribute(
      'href',
      'https://t.me/c/123/42',
    );
  });

  it('should version the existing poster URL in edit mode', () => {
    const gigCandidate = createReviewingGigCandidate();
    gigCandidate.gigDraft.posterUrl = 'https://posters.example/gig-candidate.jpg?size=large';

    renderForm(gigCandidate);

    const versionedPosterUrl = 'https://posters.example/gig-candidate.jpg?size=large&v=4';
    expect(screen.getByRole('img', { name: 'Poster preview' })).toHaveAttribute(
      'src',
      versionedPosterUrl,
    );
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

  it('should map lookup location text to catalog identifiers', async () => {
    lookupGigCandidateDraftMock.mockResolvedValueOnce({
      gigDraft: {
        title: 'Looked-up Band',
        date: '2026-09-20',
        ticketsUrl: 'https://tickets.example/looked-up-band',
      },
      locationHint: {
        locality: 'Barcelona',
        country: 'es',
        venue: 'Sala Apolo',
      },
    });
    renderForm();

    fireEvent.change(screen.getByLabelText('Title:*'), { target: { value: 'Band' } });
    await selectOption(/Locality/, 'Barcelona');
    fireEvent.click(screen.getByRole('button', { name: 'Find info with AI' }));

    expect(await screen.findByDisplayValue('Looked-up Band')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Venues/ })).toHaveTextContent('Sala Apolo');
    expect(
      screen.getByText('AI suggested location: Sala Apolo · Barcelona · es'),
    ).toBeInTheDocument();
    expect(lookupGigCandidateDraftMock).toHaveBeenCalledWith({
      title: 'Band',
      location: 'Barcelona, Spain',
    });
    expect(createGigCandidateMock).not.toHaveBeenCalled();
  });
});
