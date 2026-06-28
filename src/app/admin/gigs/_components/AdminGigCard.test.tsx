import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

import AdminGigCard from '@/app/admin/gigs/_components/AdminGigCard';
import type { AdminGigDetail } from '@/app/admin/gigs/types';
import { GigStatusAPI } from '@/app/admin/gigs/types';

const mockPostAdminGigApprove = vi.fn();

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

vi.mock('@/lib/admin-api', () => ({
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

  it('should show public view link for approved gig', () => {
    renderCard({ ...baseGig, status: GigStatusAPI.Published });

    expect(screen.getByRole('link', { name: 'Public view' })).toHaveAttribute(
      'href',
      '/gigs/radiohead-barcelona',
    );
  });

  it('should show telegram post link when approved gig has publishPostUrl', () => {
    renderCard({
      ...baseGig,
      status: GigStatusAPI.Published,
      publishPostUrl: 'https://t.me/gigschannel/99',
    });

    expect(screen.getByRole('link', { name: 'Post' })).toHaveAttribute(
      'href',
      'https://t.me/gigschannel/99',
    );
  });

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
