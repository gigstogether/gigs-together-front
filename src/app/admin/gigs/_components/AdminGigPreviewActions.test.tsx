import { fireEvent, render, screen } from '@testing-library/react';

import AdminGigPreviewActions from './AdminGigPreviewActions';
import type { AdminGigDetail } from '../_lib/types';

const post = vi.fn();
const toggleVisibility = vi.fn();
vi.mock('@/app/admin/gigs/_hooks/use-admin-gig-actions', () => ({
  useAdminGigActions: () => ({
    isPosting: false,
    isChangingVisibility: false,
    post,
    toggleVisibility,
  }),
}));

const gig: AdminGigDetail = {
  publicId: 'gig-2026-09-17',
  title: 'Gig',
  isVisible: true,
  version: 3,
  source: { type: 'user', userId: '42', origin: { type: 'admin' } },
  date: '2026-09-17',
  city: 'barcelona',
  country: 'ES',
  venue: 'Venue',
};

describe('AdminGigPreviewActions', () => {
  it('should offer Post, visibility, and edit actions without approve/reject', () => {
    render(
      <AdminGigPreviewActions
        gig={gig}
        editHref="/admin/gigs/gig-2026-09-17/edit"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /post/i }));
    fireEvent.click(screen.getByRole('button', { name: /hide/i }));
    expect(post).toHaveBeenCalledOnce();
    expect(toggleVisibility).toHaveBeenCalledOnce();
    expect(screen.queryByRole('button', { name: /approve|reject/i })).not.toBeInTheDocument();
  });
});
