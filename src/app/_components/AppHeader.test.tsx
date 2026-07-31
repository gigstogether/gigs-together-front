import { render, screen, waitFor } from '@testing-library/react';

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

  it('should show admin header navigation when admin visits an admin route', async () => {
    mockUsePathname.mockReturnValue('/admin/gigs');

    render(<AppHeader />);

    await waitFor(() => {
      expect(screen.getByTestId('admin-header-nav-menu')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('header-calendar')).not.toBeInTheDocument();
  });

  it('should not show admin header navigation when user is not admin', async () => {
    mockUsePathname.mockReturnValue('/admin');
    mockUseTelegramAuth.mockReturnValue({ authState: null });

    render(<AppHeader />);

    await waitFor(() => {
      expect(screen.queryByTestId('admin-header-nav-menu')).not.toBeInTheDocument();
    });
  });

  it('should render environment badge when badge props are provided', () => {
    render(
      <AppHeader
        badgeAlt="DEV environment badge"
        badgeSrc="/badge-dev.svg"
      />,
    );

    expect(screen.getByAltText('DEV environment badge')).toHaveAttribute('src', '/badge-dev.svg');
  });
});
