import { act, renderHook } from '@testing-library/react';
import { useModeratorTelegramSession } from '@/app/admin/_hooks/use-moderator-telegram-session';

const { useTelegramAuthMock } = vi.hoisted(() => ({
  useTelegramAuthMock: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

vi.mock('@/hooks/use-telegram-auth', () => ({
  useTelegramAuth: useTelegramAuthMock,
}));

vi.mock('@/hooks/use-telegram-mini-app-env', () => ({
  useTelegramMiniAppEnv: () => 'browser' as const,
}));

describe('useModeratorTelegramSession', () => {
  beforeEach(() => {
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

  it('should start shared sign-in from the moderator handler', async () => {
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
    await act(() => result.current.handleSignIn());

    expect(signIn).toHaveBeenCalledTimes(1);
  });
});
