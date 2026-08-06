import type { ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import AdminLayoutClient from '@/app/admin/_components/AdminLayoutClient';
import type { UseModeratorTelegramSessionResult } from '@/app/admin/_hooks/use-moderator-telegram-session';
import { requestTelegramSignIn } from '@/lib/telegram/telegram-auth';
import { buildModeratorTelegramSessionMock } from '@/test/moderator-telegram-session-mock';

const mockUseModeratorTelegramSession = vi.fn<() => UseModeratorTelegramSessionResult>();

vi.mock('@/app/admin/_hooks/use-moderator-telegram-session', () => ({
  useModeratorTelegramSession: () => mockUseModeratorTelegramSession(),
}));

vi.mock('@/lib/telegram/telegram-auth', () => ({
  requestTelegramSignIn: vi.fn(),
}));

vi.mock('@/app/admin/_components/AdminShell', () => ({
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="admin-shell">{children}</div>
  ),
}));

describe('AdminLayoutClient', () => {
  beforeEach(() => {
    mockUseModeratorTelegramSession.mockReset();
    vi.mocked(requestTelegramSignIn).mockReset();
  });

  it('should show a loading state when auth bootstrap is not finished', () => {
    mockUseModeratorTelegramSession.mockReturnValue(
      buildModeratorTelegramSessionMock({
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
      buildModeratorTelegramSessionMock({
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
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.queryByTestId('admin-shell')).not.toBeInTheDocument();
  });

  it('should explain how to recover when Telegram Mini App authentication fails', () => {
    mockUseModeratorTelegramSession.mockReturnValue(
      buildModeratorTelegramSessionMock({
        authState: null,
        hasTelegramMiniAppAuthError: true,
      }),
    );

    render(
      <AdminLayoutClient>
        <div data-testid="admin-child" />
      </AdminLayoutClient>,
    );

    expect(screen.getByText('Telegram sign-in failed')).toBeInTheDocument();
    expect(screen.getByText(/Fully close Telegram, reopen it/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sign in' })).not.toBeInTheDocument();
  });

  it('should open shared sign-in modal when guest clicks Sign in', () => {
    mockUseModeratorTelegramSession.mockReturnValue(
      buildModeratorTelegramSessionMock({
        authState: null,
        isLoadingAuthState: false,
      }),
    );

    render(
      <AdminLayoutClient>
        <div data-testid="admin-child" />
      </AdminLayoutClient>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(requestTelegramSignIn).toHaveBeenCalledTimes(1);
  });

  it('should deny access to signed-in non-admin users', () => {
    mockUseModeratorTelegramSession.mockReturnValue(
      buildModeratorTelegramSessionMock({
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
      buildModeratorTelegramSessionMock({
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
