import { render, screen } from '@testing-library/react';

import AdminGigCard from './AdminGigCard';
import type { AdminGigDetail } from '../_lib/types';

vi.mock('./AdminGigPreviewActions', () => ({ default: () => <div>actions</div> }));

const gig: AdminGigDetail = {
  publicId: 'gig-2026-09-17',
  title: 'Gig',
  isVisible: false,
  version: 3,
  source: { type: 'user', userId: 'internal-user-id', origin: { type: 'admin' } },
  date: '2026-09-17',
  city: 'barcelona',
  country: 'ES',
  venue: 'Venue',
};

describe('AdminGigCard', () => {
  it('should show source and hidden visibility without a status badge', () => {
    render(<AdminGigCard gig={gig} />);
    expect(screen.getByLabelText('Hidden')).toBeInTheDocument();
    expect(screen.getByText(/Source: user internal-user-id/)).toBeInTheDocument();
    expect(screen.queryByText('Public view')).not.toBeInTheDocument();
  });
});
