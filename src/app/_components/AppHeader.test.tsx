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

describe('AppHeader', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/feed/es/barcelona');
    mockUseTelegramAuth.mockReturnValue({
      authState: { displayLabel: '@admin', isAdmin: true },
    });
  });

  it('should show Admin label in the center when admin visits an admin route', () => {
    mockUsePathname.mockReturnValue('/admin/gigs');

    render(<AppHeader />);

    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.queryByTestId('header-calendar')).not.toBeInTheDocument();
  });

  it('should not show Admin label when user is not admin', () => {
    mockUsePathname.mockReturnValue('/admin');
    mockUseTelegramAuth.mockReturnValue({ authState: null });

    render(<AppHeader />);

    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });
});
