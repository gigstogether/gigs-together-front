import { act, renderHook } from '@testing-library/react';
import { useTelegramAuth } from '@/hooks/use-telegram-auth';

const { getTelegramLaunchParamsSnapshotMock, hookMocks, miniAppEnvMock, mockClientEnv } =
  vi.hoisted(() => ({
    getTelegramLaunchParamsSnapshotMock:
      vi.fn<() => { initData?: string; startParam?: string } | undefined>(),
    hookMocks: {
      clearExplicitTelegramSignIn: vi.fn(),
      clearStoredTelegramClientProfile: vi.fn(),
      signInWithTelegram: vi.fn<() => Promise<void>>(),
      signOutTelegramAuthOnServer: vi.fn<() => Promise<void>>(),
    },
    miniAppEnvMock: vi.fn<() => 'browser' | 'mini' | 'unknown'>(),
    mockClientEnv: {
      isAuthEnabled: true,
      telegramClientProfileStorageKey: 'gt_test_profile',
      telegramOidcClientId: 123456,
    },
  }));

vi.mock('@/env/client-env', () => ({
  clientEnv: mockClientEnv,
}));

vi.mock('@/hooks/use-telegram-mini-app-env', () => ({
  useTelegramMiniAppEnv: miniAppEnvMock,
}));

vi.mock('@/lib/telegram/telegram-webapp', () => ({
  getTelegramLaunchParamsSnapshot: getTelegramLaunchParamsSnapshotMock,
}));

vi.mock('@/lib/telegram/telegram-auth', () => ({
  clearExplicitTelegramSignIn: hookMocks.clearExplicitTelegramSignIn,
  clearStoredTelegramClientProfile: hookMocks.clearStoredTelegramClientProfile,
  getTelegramClientProfileSnapshot: () => null,
  signInWithTelegram: hookMocks.signInWithTelegram,
  signOutTelegramAuthOnServer: hookMocks.signOutTelegramAuthOnServer,
  subscribeTelegramClientProfile: () => () => undefined,
}));

describe('useTelegramAuth', () => {
  beforeEach(() => {
    mockClientEnv.isAuthEnabled = true;
    mockClientEnv.telegramOidcClientId = 123456;
    miniAppEnvMock.mockReset();
    miniAppEnvMock.mockReturnValue('browser');
    getTelegramLaunchParamsSnapshotMock.mockReset();
    hookMocks.clearExplicitTelegramSignIn.mockReset();
    hookMocks.clearStoredTelegramClientProfile.mockReset();
    hookMocks.signInWithTelegram.mockReset();
    hookMocks.signInWithTelegram.mockResolvedValue();
    hookMocks.signOutTelegramAuthOnServer.mockReset();
    hookMocks.signOutTelegramAuthOnServer.mockResolvedValue();
  });

  it('should keep a guest signed out without starting Mini App authentication', () => {
    const { result } = renderHook(() => useTelegramAuth());

    expect(result.current.authState).toBeNull();
    expect(result.current.isLoadingAuthState).toBe(false);
    expect(hookMocks.signInWithTelegram).not.toHaveBeenCalled();
  });

  it('should make Mini App sign-in available without an OIDC client id when initData exists', () => {
    mockClientEnv.telegramOidcClientId = 0;
    miniAppEnvMock.mockReturnValue('mini');
    getTelegramLaunchParamsSnapshotMock.mockReturnValue({ initData: 'user=test' });

    const { result } = renderHook(() => useTelegramAuth());

    expect(result.current.isTelegramSignInAvailable).toBe(true);
  });

  it('should keep Mini App sign-in unavailable when captured initData is missing', () => {
    miniAppEnvMock.mockReturnValue('mini');
    getTelegramLaunchParamsSnapshotMock.mockReturnValue({ startParam: 'edit-token' });

    const { result } = renderHook(() => useTelegramAuth());

    expect(result.current.isTelegramSignInAvailable).toBe(false);
  });

  it('should keep sign-in unavailable when authentication is disabled', () => {
    mockClientEnv.isAuthEnabled = false;

    const { result } = renderHook(() => useTelegramAuth());

    expect(result.current.isTelegramSignInAvailable).toBe(false);
  });

  it('should authenticate only after the explicit sign-in action', async () => {
    miniAppEnvMock.mockReturnValue('mini');
    getTelegramLaunchParamsSnapshotMock.mockReturnValue({ initData: 'user=test' });
    const { result } = renderHook(() => useTelegramAuth());

    await act(() => result.current.signIn());

    expect(hookMocks.signInWithTelegram).toHaveBeenCalledTimes(1);
  });

  it('should clear explicit sign-in state and the cached profile on logout', async () => {
    const { result } = renderHook(() => useTelegramAuth());

    await act(() => result.current.signOut());

    expect(hookMocks.clearExplicitTelegramSignIn).toHaveBeenCalledTimes(1);
    expect(hookMocks.clearStoredTelegramClientProfile).toHaveBeenCalledTimes(1);
    expect(hookMocks.signOutTelegramAuthOnServer).toHaveBeenCalledTimes(1);
  });
});
