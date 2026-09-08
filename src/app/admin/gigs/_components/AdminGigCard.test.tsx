import { render, screen } from '@testing-library/react';

import AdminGigCard from './AdminGigCard';
import type { AdminGigDetail } from '../_lib/types';

vi.mock('./AdminGigPreviewActions', () => ({ default: () => <div>actions</div> }));

const gig: AdminGigDetail = {
  publicId: 'gig-2026-09-17',
  title: 'Gig',
  isVisible: false,
  version: 3,
  source: {
    type: 'user',
    userId: 'internal-user-id',
    displayName: 'Test Admin',
    isCurrentlyAdmin: true,
    telegramUsername: 'test_admin',
    origin: { type: 'admin' },
  },
  date: '2026-09-17',
  city: 'barcelona',
  country: 'ES',
  venue: 'Venue',
};

describe('AdminGigCard', () => {
  it('should show source and hidden visibility without a status badge', () => {
    render(<AdminGigCard gig={gig} />);
    expect(screen.getByLabelText('Hidden')).toBeInTheDocument();
    expect(
      screen.getByText('Source: user · Test Admin (currently admin) · TG: @test_admin'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/internal-user-id/)).not.toBeInTheDocument();
    expect(screen.queryByText('Public view')).not.toBeInTheDocument();
  });

  it('should show a non-admin submitter name without an admin marker', () => {
    render(
      <AdminGigCard
        gig={{
          ...gig,
          source: {
            type: 'user',
            userId: 'internal-user-id',
            displayName: 'Test User',
            isCurrentlyAdmin: false,
            origin: { type: 'form' },
          },
        }}
      />,
    );

    expect(screen.getByText('Source: user · Test User')).toBeInTheDocument();
    expect(screen.queryByText(/internal-user-id/)).not.toBeInTheDocument();
  });
});
