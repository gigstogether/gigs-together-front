import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

import AdminGigCard from '@/app/admin/gigs/_components/AdminGigCard';
import type { AdminGigDetail } from '@/app/admin/gigs/_lib/types';
import { GigStatusAPI } from '@/app/admin/gigs/_lib/types';

const mockPostAdminGigApprove = vi.fn();

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

vi.mock('@/app/admin/_lib/admin-api', () => ({
  postAdminGigApprove: (publicId: string) => mockPostAdminGigApprove(publicId),
  postAdminGigReject: vi.fn(),
  postAdminGigPost: vi.fn(),
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

function renderCard(gig: AdminGigDetail = baseGig) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AdminGigCard gig={gig} />
    </QueryClientProvider>,
  );
}

describe('AdminGigCard', () => {
  beforeEach(() => {
    mockPostAdminGigApprove.mockReset();
    mockPostAdminGigApprove.mockResolvedValue(undefined);
  });

  it('should not show public view or telegram post links for pending gig', () => {
    renderCard();

    expect(screen.queryByRole('link', { name: 'Public view' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Post' })).not.toBeInTheDocument();
  });

  it.each(publishableGigStatuses)(
    'should show public view link when gig status is %s',
    (status) => {
      renderCard({ ...baseGig, status });

      expect(screen.getByRole('link', { name: 'Public view' })).toHaveAttribute(
        'href',
        '/gigs/radiohead-barcelona',
      );
    },
  );

  it.each(publishableGigStatuses)(
    'should show telegram post link when gig status is %s and publishPostUrl is present',
    (status) => {
      renderCard({
        ...baseGig,
        status,
        publishPostUrl: 'https://t.me/gigschannel/99',
      });

      expect(screen.getByRole('link', { name: 'Post' })).toHaveAttribute(
        'href',
        'https://t.me/gigschannel/99',
      );
    },
  );

  it('should show moderation post link when moderationPostUrl is present', () => {
    renderCard({
      ...baseGig,
      moderationPostUrl: 'https://t.me/gigschannel/77',
    });

    expect(screen.getByText('Suggested by 42')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Moderation post' })).toHaveAttribute(
      'href',
      'https://t.me/gigschannel/77',
    );
    expect(screen.queryByText('No moderation post linked.')).not.toBeInTheDocument();
  });
});
