import { act, renderHook } from '@testing-library/react';
import { useModeratorTelegramSession } from '@/app/admin/_hooks/use-moderator-telegram-session';

const { requestTelegramSignInMock, useTelegramAuthMock } = vi.hoisted(() => ({
  requestTelegramSignInMock: vi.fn(),
  useTelegramAuthMock: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

vi.mock('@/hooks/use-telegram-auth', () => ({
  useTelegramAuth: useTelegramAuthMock,
}));

vi.mock('@/lib/telegram/telegram-auth', () => ({
  requestTelegramSignIn: requestTelegramSignInMock,
}));

vi.mock('@/hooks/use-telegram-mini-app-env', () => ({
  useTelegramMiniAppEnv: () => 'browser' as const,
}));

describe('useModeratorTelegramSession', () => {
  beforeEach(() => {
    requestTelegramSignInMock.mockReset();
    useTelegramAuthMock.mockReset();
    useTelegramAuthMock.mockReturnValue({
      authState: null,
      isLoadingAuthState: false,
      isSigningIn: false,
      isTelegramSignInAvailable: true,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });
  });

  it('should expose sign-in availability from the shared auth hook', () => {
    const { result } = renderHook(() => useModeratorTelegramSession());

    expect(result.current.isTelegramSignInAvailable).toBe(true);
  });

  it('should request the shared sign-in modal from the moderator handler', () => {
    const signIn = vi.fn<() => Promise<void>>().mockResolvedValue();
    useTelegramAuthMock.mockReturnValue({
      authState: null,
      isLoadingAuthState: false,
      isSigningIn: false,
      isTelegramSignInAvailable: true,
      signIn,
      signOut: vi.fn(),
    });

    const { result } = renderHook(() => useModeratorTelegramSession());
    act(() => result.current.handleSignIn());

    expect(requestTelegramSignInMock).toHaveBeenCalledTimes(1);
    expect(signIn).not.toHaveBeenCalled();
  });
});
