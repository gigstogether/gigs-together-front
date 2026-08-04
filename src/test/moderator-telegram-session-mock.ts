import type { UseModeratorTelegramSessionResult } from '@/app/admin/_hooks/use-moderator-telegram-session';

export function buildModeratorTelegramSessionMock(
  partial: Partial<UseModeratorTelegramSessionResult> = {},
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

export function stubResizeObserver(): void {
  class ResizeObserverMock {
    observe() {}
    disconnect() {}
    unobserve() {}
  }

  vi.stubGlobal('ResizeObserver', ResizeObserverMock);
}
