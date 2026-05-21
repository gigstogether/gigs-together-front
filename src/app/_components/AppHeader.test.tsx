import { render, screen } from '@testing-library/react';

import AppHeader from '@/app/_components/AppHeader';

const mockUsePathname = vi.fn();
const mockUseTelegramAuth = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

vi.mock('@/hooks/use-telegram-auth', () => ({
  useTelegramAuth: () => mockUseTelegramAuth(),
}));

vi.mock('@/app/_components/HeaderConfigProvider', () => ({
  useHeaderConfig: () => ({ config: {} }),
}));

vi.mock('@/app/_components/HeaderCalendar', () => ({
  default: () => <div data-testid="header-calendar" />,
}));

vi.mock('@/app/_components/HeaderActions', () => ({
  default: () => <div data-testid="header-actions" />,
}));

vi.mock('@/app/admin/_components/AdminHeaderNavMenu', () => ({
  default: () => <div data-testid="admin-header-nav-menu" />,
}));

describe('AppHeader', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/feed/es/barcelona');
    mockUseTelegramAuth.mockReturnValue({
      authState: { displayLabel: '@admin', isAdmin: true },
    });
  });

  it('should show admin header navigation when admin visits an admin route', () => {
    mockUsePathname.mockReturnValue('/admin/gigs');

    render(<AppHeader />);

    expect(screen.getByTestId('admin-header-nav-menu')).toBeInTheDocument();
    expect(screen.queryByTestId('header-calendar')).not.toBeInTheDocument();
  });

  it('should not show admin header navigation when user is not admin', () => {
    mockUsePathname.mockReturnValue('/admin');
    mockUseTelegramAuth.mockReturnValue({ authState: null });

    render(<AppHeader />);

    expect(screen.queryByTestId('admin-header-nav-menu')).not.toBeInTheDocument();
  });
});
