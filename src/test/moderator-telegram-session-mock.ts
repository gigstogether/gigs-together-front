import type { UseModeratorTelegramSessionResult } from '@/app/admin/_hooks/use-moderator-telegram-session';

export function buildModeratorTelegramSessionMock(
  partial: Partial<UseModeratorTelegramSessionResult> = {},
): UseModeratorTelegramSessionResult {
  return {
    authState: null,
    handleSignIn: vi.fn(),
    isLoadingAuthState: false,
    isSigningIn: false,
    isTelegramSignInAvailable: true,
    miniAppEnv: 'browser',
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
