import { fireEvent, render, screen } from '@testing-library/react';

import AdminHeaderNavMenu from '@/app/admin/_components/AdminHeaderNavMenu';

const mockUseTelegramAuth = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin',
}));

vi.mock('@/hooks/use-telegram-auth', () => ({
  useTelegramAuth: () => mockUseTelegramAuth(),
}));

describe('AdminHeaderNavMenu', () => {
  beforeEach(() => {
    mockUseTelegramAuth.mockReturnValue({
      authState: { displayLabel: '@admin', isAdmin: true },
      isLoadingAuthState: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });
  });

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

  it('should not render when user is not admin', () => {
    mockUseTelegramAuth.mockReturnValue({
      authState: null,
      isLoadingAuthState: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    render(<AdminHeaderNavMenu />);

    expect(screen.queryByRole('button', { name: 'Admin navigation menu' })).toBeNull();
  });
});
