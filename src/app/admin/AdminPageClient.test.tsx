import { render, screen } from '@testing-library/react';
import AdminPageClient from '@/app/admin/AdminPageClient';
import type { UseModeratorTelegramSessionResult } from '@/hooks/use-moderator-telegram-session';

const mockUseModeratorTelegramSession = vi.fn<() => UseModeratorTelegramSessionResult>();

vi.mock('@/hooks/use-moderator-telegram-session', () => ({
  useModeratorTelegramSession: () => mockUseModeratorTelegramSession(),
}));

vi.mock('@/app/_components/SignInContent', () => ({
  default: () => <div data-testid="sign-in-stub" />,
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

describe('AdminPageClient', () => {
  beforeEach(() => {
    mockUseModeratorTelegramSession.mockReset();
  });

  it('should show a loading state when auth bootstrap is not finished', () => {
    mockUseModeratorTelegramSession.mockReturnValue(
      sessionMock({
        isLoadingAuthState: true,
      }),
    );

    render(<AdminPageClient />);

    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('should explain access restriction to guests', () => {
    mockUseModeratorTelegramSession.mockReturnValue(
      sessionMock({
        authState: null,
        isLoadingAuthState: false,
      }),
    );

    render(<AdminPageClient />);

    expect(screen.getByText('Restricted area')).toBeInTheDocument();
    expect(screen.getByTestId('sign-in-stub')).toBeInTheDocument();
  });

  it('should deny access to signed-in non-admin users', () => {
    mockUseModeratorTelegramSession.mockReturnValue(
      sessionMock({
        authState: { displayLabel: '@someone', isAdmin: false },
      }),
    );

    render(<AdminPageClient />);

    expect(screen.getByText('Access denied')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
  });

  it('should confirm access for admin users', () => {
    mockUseModeratorTelegramSession.mockReturnValue(
      sessionMock({
        authState: { displayLabel: '@admin', isAdmin: true },
      }),
    );

    render(<AdminPageClient />);

    expect(screen.getByText('You are signed in to the admin area.')).toBeInTheDocument();
  });
});
