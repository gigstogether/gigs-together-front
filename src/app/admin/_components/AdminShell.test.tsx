import { fireEvent, render, screen } from '@testing-library/react';

import AdminShell from '@/app/admin/_components/AdminShell';
import type { UseModeratorTelegramSessionResult } from '@/hooks/use-moderator-telegram-session';

const mockUseModeratorTelegramSession = vi.fn<() => UseModeratorTelegramSessionResult>();

vi.mock('@/hooks/use-moderator-telegram-session', () => ({
  useModeratorTelegramSession: () => mockUseModeratorTelegramSession(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin',
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

describe('AdminShell', () => {
  beforeEach(() => {
    mockUseModeratorTelegramSession.mockReset();
    mockUseModeratorTelegramSession.mockReturnValue(sessionMock({}));

    class ResizeObserverMock {
      observe() {}
      disconnect() {}
      unobserve() {}
    }

    vi.stubGlobal('ResizeObserver', ResizeObserverMock);
  });

  it('should toggle navigation collapse state when mobile button is clicked', () => {
    render(
      <AdminShell>
        <div>Content</div>
      </AdminShell>,
    );

    const collapseButton = screen.getByRole('button', { name: 'Collapse navigation' });
    expect(collapseButton).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(collapseButton);

    const expandButton = screen.getByRole('button', { name: 'Expand navigation' });
    expect(expandButton).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(expandButton);

    expect(screen.getByRole('button', { name: 'Collapse navigation' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });
});
