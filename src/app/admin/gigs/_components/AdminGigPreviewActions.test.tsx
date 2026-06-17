import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import AdminGigPreviewActions from '@/app/admin/gigs/_components/AdminGigPreviewActions';
import type { AdminGigDetail } from '@/app/admin/gigs/types';
import { GigStatus, GigStatusAPI } from '@/app/admin/gigs/types';

const mockPostAdminGigApprove = vi.fn();
const mockPostAdminGigReject = vi.fn();

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

vi.mock('@/lib/admin-api', () => ({
  postAdminGigApprove: (publicId: string) => mockPostAdminGigApprove(publicId),
  postAdminGigReject: (publicId: string) => mockPostAdminGigReject(publicId),
}));

const gig: AdminGigDetail = {
  publicId: 'radiohead-barcelona',
  title: 'Radiohead',
  date: '2026-06-12',
  city: 'barcelona',
  country: 'ES',
  venue: 'Palau Sant Jordi',
  status: GigStatusAPI.Pending,
  suggestedBy: { userId: '42' },
};

function renderActions(listFilter: GigStatus) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AdminGigPreviewActions
        gig={gig}
        listFilter={listFilter}
        editHref="/admin/gigs/radiohead-barcelona/edit"
      />
    </QueryClientProvider>,
  );
}

describe('AdminGigPreviewActions', () => {
  beforeEach(() => {
    mockPostAdminGigApprove.mockReset();
    mockPostAdminGigReject.mockReset();
    mockPostAdminGigApprove.mockResolvedValue(undefined);
    mockPostAdminGigReject.mockResolvedValue(undefined);
  });

  it('should call approve endpoint when Approve is clicked on pending gig', async () => {
    renderActions(GigStatus.Pending);

    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));

    await waitFor(() => {
      expect(mockPostAdminGigApprove).toHaveBeenCalledWith('radiohead-barcelona');
    });
    expect(mockPostAdminGigReject).not.toHaveBeenCalled();
  });

  it('should call reject endpoint when Reject is clicked on pending gig', async () => {
    renderActions(GigStatus.Pending);

    fireEvent.click(screen.getByRole('button', { name: 'Reject' }));

    await waitFor(() => {
      expect(mockPostAdminGigReject).toHaveBeenCalledWith('radiohead-barcelona');
    });
    expect(mockPostAdminGigApprove).not.toHaveBeenCalled();
  });

  it('should show only edit action when gig is rejected', () => {
    renderActions(GigStatus.Rejected);

    expect(screen.getByRole('link', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument();
  });
});
