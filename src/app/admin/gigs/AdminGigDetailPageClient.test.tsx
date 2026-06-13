import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';

import AdminGigDetailPageClient from '@/app/admin/gigs/AdminGigDetailPageClient';
import type { AdminGigFormData } from '@/app/admin/gigs/types';

const mockFetchAdminGigByPublicId = vi.fn();

vi.mock('@/lib/admin-api', () => ({
  fetchAdminGigByPublicId: (params: { publicId: string }) => mockFetchAdminGigByPublicId(params),
}));

const gigFormData: AdminGigFormData = {
  publicId: 'radiohead-barcelona',
  title: 'Radiohead',
  date: '2026-06-12',
  city: 'barcelona',
  country: 'ES',
  venue: 'Palau Sant Jordi',
  ticketsUrl: 'https://tickets.example',
  status: 'Pending',
  suggestedBy: { userId: '42', username: 'mod' },
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
      expect(screen.getByRole('heading', { name: 'Radiohead' })).toBeInTheDocument();
    });
  });

  it('should show invalid id message when publicId is empty', () => {
    renderWithQueryClient('   ');

    expect(screen.getByText('Invalid gig id.')).toBeInTheDocument();
    expect(mockFetchAdminGigByPublicId).not.toHaveBeenCalled();
  });
});
