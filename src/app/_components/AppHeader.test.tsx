import { render, screen, waitFor } from '@testing-library/react';

import AppHeader from '@/app/_components/AppHeader';

vi.mock('server-only', () => ({}));

const mockServerEnv = vi.hoisted(() => ({
  isDevelopment: false,
  isStaging: false,
}));

vi.mock('@/env/server-env', () => ({
  serverEnv: mockServerEnv,
}));

const mockUseTelegramAuth = vi.fn();

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
    mockServerEnv.isDevelopment = false;
    mockServerEnv.isStaging = false;
    mockUseTelegramAuth.mockReturnValue({
      authState: { displayLabel: '@admin', isAdmin: true },
    });
  });

  it('should show admin header navigation when admin header nav is enabled for an admin user', async () => {
    render(<AppHeader isAdminHeaderNavEnabled />);

    await waitFor(() => {
      expect(screen.getByTestId('admin-header-nav-menu')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('header-calendar')).not.toBeInTheDocument();
  });

  it('should not show admin header navigation when user is not admin', async () => {
    mockUseTelegramAuth.mockReturnValue({ authState: null });

    render(<AppHeader isAdminHeaderNavEnabled />);

    await waitFor(() => {
      expect(screen.queryByTestId('admin-header-nav-menu')).not.toBeInTheDocument();
    });
  });

  it('should show calendar when showCalendar is enabled', async () => {
    render(
      <AppHeader
        country="es"
        city="barcelona"
        showCalendar
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('header-calendar')).toBeInTheDocument();
    });
  });

  it('should render environment badge in development', () => {
    mockServerEnv.isDevelopment = true;

    render(<AppHeader />);

    expect(screen.getByAltText('DEV environment badge')).toHaveAttribute('src', '/badge-dev.svg');
  });

  it('should not render environment badge in production', () => {
    render(<AppHeader />);

    expect(screen.queryByAltText('DEV environment badge')).not.toBeInTheDocument();
    expect(screen.queryByAltText('STG environment badge')).not.toBeInTheDocument();
  });
});
