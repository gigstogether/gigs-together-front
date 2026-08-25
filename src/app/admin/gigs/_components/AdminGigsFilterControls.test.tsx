import { fireEvent, render, screen } from '@testing-library/react';

import AdminGigsFilterControls from '@/app/admin/gigs/_components/AdminGigsFilterControls';
import { GigStatusFilter } from '@/app/admin/gigs/_lib/types';

describe('AdminGigsFilterControls', () => {
  it('should report the selected Gig status', () => {
    const onFilterChange = vi.fn();
    render(
      <AdminGigsFilterControls
        filter={GigStatusFilter.Pending}
        onFilterChange={onFilterChange}
        newGigHref="/admin/gigs/new"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Approved' }));

    expect(onFilterChange).toHaveBeenCalledWith(GigStatusFilter.Approved);
  });

  it('should link to Gig creation', () => {
    render(
      <AdminGigsFilterControls
        filter={GigStatusFilter.Pending}
        onFilterChange={vi.fn()}
        newGigHref="/admin/gigs/new"
      />,
    );

    expect(screen.getByRole('link', { name: 'New gig' })).toHaveAttribute(
      'href',
      '/admin/gigs/new',
    );
  });
});
