import { render, screen } from '@testing-library/react';

import AdminPageClient from '@/app/admin/AdminPageClient';
import type { UseModeratorTelegramSessionResult } from '@/hooks/use-moderator-telegram-session';

const mockUseModeratorTelegramSession = vi.fn<() => UseModeratorTelegramSessionResult>();

vi.mock('@/hooks/use-moderator-telegram-session', () => ({
  useModeratorTelegramSession: () => mockUseModeratorTelegramSession(),
}));

function sessionMock(
  partial: Partial<UseModeratorTelegramSessionResult>,
): UseModeratorTelegramSessionResult {
  return {
    authState: { displayLabel: '@admin', isAdmin: true },
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
    mockUseModeratorTelegramSession.mockReturnValue(sessionMock({}));
  });

  it('should confirm access for admin users', () => {
    render(<AdminPageClient />);

    expect(screen.getByText('You are signed in to the admin area.')).toBeInTheDocument();
  });

  it('should show sign out in browser', () => {
    render(<AdminPageClient />);

    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
  });

  it('should hide sign out in Telegram mini app', () => {
    mockUseModeratorTelegramSession.mockReturnValue(
      sessionMock({
        miniAppEnv: 'mini',
      }),
    );

    render(<AdminPageClient />);

    expect(screen.queryByRole('button', { name: 'Sign out' })).not.toBeInTheDocument();
  });
});
