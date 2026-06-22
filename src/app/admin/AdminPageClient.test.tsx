import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';

import AdminPageClient from '@/app/admin/AdminPageClient';

const mockFetchAdminDashboard = vi.fn();

vi.mock('@/lib/admin-api', () => ({
  fetchAdminDashboard: () => mockFetchAdminDashboard(),
}));

function renderWithQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AdminPageClient />
    </QueryClientProvider>,
  );
}

describe('AdminPageClient', () => {
  beforeEach(() => {
    mockFetchAdminDashboard.mockReset();
    mockFetchAdminDashboard.mockResolvedValue({
      summary: {
        pendingGigsCount: 3,
        publishedGigsCount: 12,
      },
    });
  });

  it('should show dashboard summary counts', async () => {
    renderWithQueryClient();

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
    });
  });

  it('should show section quick links', () => {
    renderWithQueryClient();

    expect(screen.getByText('Gigs')).toBeInTheDocument();
    expect(screen.getByText('Translations')).toBeInTheDocument();
  });
});
