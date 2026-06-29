import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { buildAdminGigEditRoute } from '@/app/admin/gigs/admin-gig-paths';
import AdminGigPreviewActions from '@/app/admin/gigs/_components/AdminGigPreviewActions';
import type { AdminGigDetail } from '@/app/admin/gigs/types';
import { GigStatusAPI } from '@/app/admin/gigs/types';

const mockPostAdminGigApprove = vi.fn();
const mockPostAdminGigReject = vi.fn();
const mockPostAdminGigPost = vi.fn();

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

vi.mock('@/lib/admin-api', () => ({
  postAdminGigApprove: (publicId: string) => mockPostAdminGigApprove(publicId),
  postAdminGigReject: (publicId: string) => mockPostAdminGigReject(publicId),
  postAdminGigPost: (publicId: string) => mockPostAdminGigPost(publicId),
}));

const baseGig: AdminGigDetail = {
  publicId: 'radiohead-barcelona',
  title: 'Radiohead',
  date: '2026-06-12',
  city: 'barcelona',
  country: 'ES',
  venue: 'Palau Sant Jordi',
  status: GigStatusAPI.Pending,
  suggestedBy: { userId: '42' },
};

const publishableGigStatuses = [GigStatusAPI.Approved, GigStatusAPI.Published] as const;

function renderActions(gig: AdminGigDetail = baseGig) {
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
        editHref={buildAdminGigEditRoute('radiohead-barcelona')}
      />
    </QueryClientProvider>,
  );
}

describe('AdminGigPreviewActions', () => {
  beforeEach(() => {
    mockPostAdminGigApprove.mockReset();
    mockPostAdminGigReject.mockReset();
    mockPostAdminGigPost.mockReset();
    mockPostAdminGigApprove.mockResolvedValue(undefined);
    mockPostAdminGigReject.mockResolvedValue(undefined);
    mockPostAdminGigPost.mockResolvedValue(undefined);
  });

  it('should render Approve, Edit, and Reject on pending gig', () => {
    renderActions();

    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument();
  });

  it('should call approve endpoint when Approve is clicked on pending gig', async () => {
    renderActions();

    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));

    await waitFor(() => {
      expect(mockPostAdminGigApprove).toHaveBeenCalledWith('radiohead-barcelona');
    });
    expect(mockPostAdminGigReject).not.toHaveBeenCalled();
  });

  it('should call reject endpoint when Reject is clicked on pending gig', async () => {
    renderActions();

    fireEvent.click(screen.getByRole('button', { name: 'Reject' }));

    await waitFor(() => {
      expect(mockPostAdminGigReject).toHaveBeenCalledWith('radiohead-barcelona');
    });
    expect(mockPostAdminGigApprove).not.toHaveBeenCalled();
  });

  it('should show only edit action when gig is rejected', () => {
    renderActions({ ...baseGig, status: GigStatusAPI.Rejected });

    expect(screen.getByRole('link', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument();
  });

  it.each(publishableGigStatuses)(
    'should render Post and Edit when gig status is %s and no publish post',
    (status) => {
      renderActions({ ...baseGig, status });

      expect(screen.getByRole('button', { name: 'Post' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Edit' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument();
    },
  );

  it.each(publishableGigStatuses)(
    'should call post endpoint when Post is clicked and gig status is %s without publish post',
    async (status) => {
      renderActions({ ...baseGig, status });

      fireEvent.click(screen.getByRole('button', { name: 'Post' }));

      await waitFor(() => {
        expect(mockPostAdminGigPost).toHaveBeenCalledWith('radiohead-barcelona');
      });
    },
  );

  it.each(publishableGigStatuses)(
    'should render only Edit when gig status is %s and publishPostUrl is present',
    (status) => {
      renderActions({
        ...baseGig,
        status,
        publishPostUrl: 'https://t.me/gigschannel/99',
      });

      expect(screen.getByRole('link', { name: 'Edit' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Post' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument();
    },
  );
});
