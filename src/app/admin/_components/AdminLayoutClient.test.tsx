import type { ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import AdminLayoutClient from '@/app/admin/_components/AdminLayoutClient';
import type { UseModeratorTelegramSessionResult } from '@/app/admin/_hooks/use-moderator-telegram-session';
import { buildModeratorTelegramSessionMock } from '@/test/moderator-telegram-session-mock';

const mockUseModeratorTelegramSession = vi.fn<() => UseModeratorTelegramSessionResult>();

vi.mock('@/app/admin/_hooks/use-moderator-telegram-session', () => ({
  useModeratorTelegramSession: () => mockUseModeratorTelegramSession(),
}));

vi.mock('@/app/admin/_components/AdminShell', () => ({
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="admin-shell">{children}</div>
  ),
}));

describe('AdminLayoutClient', () => {
  beforeEach(() => {
    mockUseModeratorTelegramSession.mockReset();
  });

  it('should show a loading state before client auth state hydration finishes', () => {
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

  it('should start sign-in when a guest clicks Sign in', () => {
    const handleSignIn = vi.fn<() => Promise<void>>().mockResolvedValue();
    mockUseModeratorTelegramSession.mockReturnValue(
      buildModeratorTelegramSessionMock({
        authState: null,
        handleSignIn,
        isLoadingAuthState: false,
      }),
    );

    render(
      <AdminLayoutClient>
        <div data-testid="admin-child" />
      </AdminLayoutClient>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(handleSignIn).toHaveBeenCalledTimes(1);
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
