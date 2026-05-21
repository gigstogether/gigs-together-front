import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

import AdminLayoutClient from '@/app/admin/AdminLayoutClient';
import type { UseModeratorTelegramSessionResult } from '@/hooks/use-moderator-telegram-session';

const mockUseModeratorTelegramSession = vi.fn<() => UseModeratorTelegramSessionResult>();

vi.mock('@/hooks/use-moderator-telegram-session', () => ({
  useModeratorTelegramSession: () => mockUseModeratorTelegramSession(),
}));

vi.mock('@/app/_components/SignInContent', () => ({
  default: () => <div data-testid="sign-in-stub" />,
}));

vi.mock('@/app/admin/_components/AdminShell', () => ({
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="admin-shell">{children}</div>
  ),
}));

function sessionMock(
  partial: Partial<UseModeratorTelegramSessionResult>,
): UseModeratorTelegramSessionResult {
  return {
    authState: null,
    isLoadingAuthState: false,
    telegramBotUsername: 'gigs_test_bot',
    isTelegramSignInAvailable: true,
    miniAppEnv: 'browser',
    handleAuthenticated: vi.fn(),
    handleSignOut: vi.fn(),
    ...partial,
  };
}

describe('AdminLayoutClient', () => {
  beforeEach(() => {
    mockUseModeratorTelegramSession.mockReset();
  });

  it('should show a loading state when auth bootstrap is not finished', () => {
    mockUseModeratorTelegramSession.mockReturnValue(
      sessionMock({
        isLoadingAuthState: true,
      }),
    );

    render(
      <AdminLayoutClient>
        <div data-testid="admin-child" />
      </AdminLayoutClient>,
    );

    expect(screen.getByText('Loading…')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-shell')).not.toBeInTheDocument();
  });

  it('should explain access restriction to guests', () => {
    mockUseModeratorTelegramSession.mockReturnValue(
      sessionMock({
        authState: null,
        isLoadingAuthState: false,
      }),
    );

    render(
      <AdminLayoutClient>
        <div data-testid="admin-child" />
      </AdminLayoutClient>,
    );

    expect(screen.getByText('Restricted area')).toBeInTheDocument();
    expect(screen.getByTestId('sign-in-stub')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-shell')).not.toBeInTheDocument();
  });

  it('should deny access to signed-in non-admin users', () => {
    mockUseModeratorTelegramSession.mockReturnValue(
      sessionMock({
        authState: { displayLabel: '@someone', isAdmin: false },
      }),
    );

    render(
      <AdminLayoutClient>
        <div data-testid="admin-child" />
      </AdminLayoutClient>,
    );

    expect(screen.getByText('Access denied')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-shell')).not.toBeInTheDocument();
  });

  it('should render children inside admin shell for admin users', () => {
    mockUseModeratorTelegramSession.mockReturnValue(
      sessionMock({
        authState: { displayLabel: '@admin', isAdmin: true },
      }),
    );

    render(
      <AdminLayoutClient>
        <div data-testid="admin-child" />
      </AdminLayoutClient>,
    );

    expect(screen.getByTestId('admin-shell')).toBeInTheDocument();
    expect(screen.getByTestId('admin-child')).toBeInTheDocument();
  });
});
