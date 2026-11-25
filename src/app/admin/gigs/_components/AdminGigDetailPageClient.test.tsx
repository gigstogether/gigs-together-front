import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';

import AdminGigDetailPageClient from '@/app/admin/gigs/_components/AdminGigDetailPageClient';
import type { AdminGigFormData } from '@/app/admin/gigs/_lib/types';

const mockFetchAdminGigByPublicId = vi.fn();

vi.mock('@/app/admin/_lib/admin-api', () => ({
  fetchAdminGigByPublicId: (params: { publicId: string }) => mockFetchAdminGigByPublicId(params),
}));

const gigFormData: AdminGigFormData = {
  publicId: 'radiohead-barcelona',
  communityIds: ['community-id'],
  venueIds: ['venue-id'],
  locality: { id: 'locality-id', countryIso: 'ES', name: 'Barcelona' },
  venues: [{ id: 'venue-id', name: 'Palau Sant Jordi' }],
  title: 'Radiohead',
  date: '2026-06-12',
  ticketsUrl: 'https://tickets.example',
  isVisible: false,
  version: 3,
  source: {
    type: 'user',
    userId: '42',
    isCurrentlyAdmin: false,
    origin: { type: 'admin' },
  },
};

function renderWithQueryClient(publicId: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AdminGigDetailPageClient publicId={publicId} />
    </QueryClientProvider>,
  );
}

describe('AdminGigDetailPageClient', () => {
  beforeEach(() => {
    mockFetchAdminGigByPublicId.mockReset();
    mockFetchAdminGigByPublicId.mockResolvedValue(gigFormData);
  });

  it('should show preview card when gig loads', async () => {
    renderWithQueryClient('radiohead-barcelona');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Radiohead/ })).toBeInTheDocument();
    });
  });

  it('should show invalid id message when publicId is empty', () => {
    renderWithQueryClient('   ');

    expect(screen.getByText('Invalid gig id.')).toBeInTheDocument();
    expect(mockFetchAdminGigByPublicId).not.toHaveBeenCalled();
  });
});
