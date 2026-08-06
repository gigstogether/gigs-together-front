import { renderHook, waitFor } from '@testing-library/react';
import { useTelegramAuth } from '@/hooks/use-telegram-auth';

const hookMocks = vi.hoisted(() => ({
  bootstrapTelegramAuthFromWebApp: vi.fn<() => Promise<void>>(),
  loggerErrorFromUnknown: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    errorFromUnknown: hookMocks.loggerErrorFromUnknown,
  },
}));

vi.mock('@/lib/telegram/telegram-auth', () => ({
  bootstrapTelegramAuthFromWebApp: hookMocks.bootstrapTelegramAuthFromWebApp,
  clearStoredTelegramClientProfile: vi.fn(),
  exchangeTelegramAuthFromLoginWidget: vi.fn(),
  getTelegramMiniAppBootstrapSnapshot: () => false,
  getTelegramClientProfileSnapshot: () => null,
  signOutTelegramAuthOnServer: vi.fn(),
  subscribeTelegramMiniAppBootstrap: () => () => undefined,
  subscribeTelegramClientProfile: () => () => undefined,
}));

describe('useTelegramAuth', () => {
  beforeEach(() => {
    hookMocks.bootstrapTelegramAuthFromWebApp.mockReset();
    hookMocks.bootstrapTelegramAuthFromWebApp.mockResolvedValue();
    hookMocks.loggerErrorFromUnknown.mockReset();
  });

  it('should expose and log Mini App bootstrap failure', async () => {
    const bootstrapError = new Error('initData unavailable');
    hookMocks.bootstrapTelegramAuthFromWebApp.mockRejectedValue(bootstrapError);

    const { result } = renderHook(() => useTelegramAuth());

    await waitFor(() => {
      expect(result.current.hasTelegramMiniAppAuthError).toBe(true);
    });
    expect(hookMocks.loggerErrorFromUnknown).toHaveBeenCalledWith(
      'telegram_mini_app_bootstrap_failed',
      bootstrapError,
    );
  });

  it('should keep Mini App bootstrap error clear after successful bootstrap', async () => {
    const { result } = renderHook(() => useTelegramAuth());

    await waitFor(() => {
      expect(hookMocks.bootstrapTelegramAuthFromWebApp).toHaveBeenCalledTimes(1);
    });
    expect(result.current.hasTelegramMiniAppAuthError).toBe(false);
    expect(hookMocks.loggerErrorFromUnknown).not.toHaveBeenCalled();
  });
});
