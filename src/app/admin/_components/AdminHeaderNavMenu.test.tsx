import { fireEvent, render, screen } from '@testing-library/react';

import AdminHeaderNavMenu from '@/app/admin/_components/AdminHeaderNavMenu';

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin',
}));

describe('AdminHeaderNavMenu', () => {
  it('should open admin navigation links when menu button is clicked', () => {
    render(<AdminHeaderNavMenu />);

    fireEvent.click(screen.getByRole('button', { name: 'Admin navigation menu' }));

    expect(screen.getByRole('link', { name: 'Gigs' })).toBeInTheDocument();
  });

  it('should point chevron up when menu is open', () => {
    render(<AdminHeaderNavMenu />);

    const button = screen.getByRole('button', { name: 'Admin navigation menu' });

    expect(button).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-expanded', 'true');
  });
});
