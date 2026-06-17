import { renderHook, act } from '@testing-library/react';
import { useModeratorTelegramSession } from '@/hooks/use-moderator-telegram-session';
import type { TelegramWidgetUser } from '@/types/telegram-login';

const { mockClientEnv, toastMock } = vi.hoisted(() => ({
  mockClientEnv: {
    isAuthEnabled: true,
    telegramBotUsername: 'gigs_test_bot',
  },
  toastMock: vi.fn(),
}));

const authMocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: (args: unknown) => {
    toastMock(args);
  },
}));

vi.mock('@/hooks/use-telegram-auth', () => ({
  useTelegramAuth: () => ({
    authState: null,
    isLoadingAuthState: false,
    signIn: authMocks.signIn,
    signOut: authMocks.signOut,
  }),
}));

vi.mock('@/hooks/use-telegram-mini-app-env', () => ({
  useTelegramMiniAppEnv: () => 'browser' as const,
}));

vi.mock('@/env/client-env', () => ({
  clientEnv: mockClientEnv,
}));

const widgetUserFixture: TelegramWidgetUser = {
  id: 123,
  first_name: 'Ada',
  auth_date: 1,
  hash: 'fixture-hash',
};

describe('useModeratorTelegramSession', () => {
  beforeEach(() => {
    mockClientEnv.isAuthEnabled = true;
    mockClientEnv.telegramBotUsername = 'gigs_test_bot';
    toastMock.mockReset();
    authMocks.signIn.mockReset();
    authMocks.signOut.mockReset();
  });

  it('should show signed-in toast when profile is admin after widget sign-in', async () => {
    authMocks.signIn.mockResolvedValue({
      profile: { displayLabel: '@ada', isAdmin: true },
    });

    const { result } = renderHook(() => useModeratorTelegramSession());

    await act(async () => {
      await result.current.handleAuthenticated(widgetUserFixture);
    });

    expect(toastMock).toHaveBeenCalledWith({
      title: 'Signed in',
      description: '@ada',
    });
  });

  it('should show access denied toast when profile is not admin after widget sign-in', async () => {
    authMocks.signIn.mockResolvedValue({
      profile: { displayLabel: '@bob', isAdmin: false },
    });

    const { result } = renderHook(() => useModeratorTelegramSession());

    await act(async () => {
      await result.current.handleAuthenticated(widgetUserFixture);
    });

    expect(toastMock).toHaveBeenCalledWith({
      title: 'Access denied',
      description: 'This page is available only for admin accounts.',
      variant: 'destructive',
    });
  });

  it('should show sign-in failed toast when signIn throws ApiError', async () => {
    const { ApiError } = await import('@/lib/api-errors');
    authMocks.signIn.mockRejectedValue(new ApiError('Invalid session', 401));

    const { result } = renderHook(() => useModeratorTelegramSession());

    await act(async () => {
      await result.current.handleAuthenticated(widgetUserFixture);
    });

    expect(toastMock).toHaveBeenCalledWith({
      title: 'Sign in failed',
      description: 'Invalid session',
      variant: 'destructive',
    });
  });

  it('should keep Telegram sign-in available when auth is disabled', () => {
    mockClientEnv.isAuthEnabled = false;

    const { result } = renderHook(() => useModeratorTelegramSession());

    expect(result.current.telegramBotUsername).toBe('gigs_test_bot');
    expect(result.current.isTelegramSignInAvailable).toBe(true);
  });
});
