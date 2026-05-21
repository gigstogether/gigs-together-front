import { fireEvent, render, screen } from '@testing-library/react';

import AdminHeaderNavMenu from '@/app/admin/_components/AdminHeaderNavMenu';

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin',
}));

describe('AdminHeaderNavMenu', () => {
  it('should open admin navigation links when menu button is clicked', () => {
    render(<AdminHeaderNavMenu />);

    fireEvent.click(screen.getByRole('button', { name: 'Admin navigation menu' }));

    expect(screen.getByRole('link', { name: 'Events' })).toBeInTheDocument();
  });
});
