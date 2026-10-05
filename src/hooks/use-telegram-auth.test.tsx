import { renderHook } from '@testing-library/react';
import { useTelegramAuth } from '@/hooks/use-telegram-auth';

const hookMocks = vi.hoisted(() => ({
  exchangeTelegramAuthFromWebApp: vi.fn<() => Promise<void>>(),
}));

vi.mock('@/lib/telegram/telegram-auth', () => ({
  clearStoredTelegramClientProfile: vi.fn(),
  exchangeTelegramAuthFromWebApp: hookMocks.exchangeTelegramAuthFromWebApp,
  getTelegramClientProfileSnapshot: () => null,
  signOutTelegramAuthOnServer: vi.fn(),
  subscribeTelegramClientProfile: () => () => undefined,
}));

describe('useTelegramAuth', () => {
  beforeEach(() => {
    hookMocks.exchangeTelegramAuthFromWebApp.mockReset();
  });

  it('should keep a guest signed out without starting Mini App authentication', () => {
    const { result } = renderHook(() => useTelegramAuth());

    expect(result.current.authState).toBeNull();
    expect(result.current.isLoadingAuthState).toBe(false);
    expect(hookMocks.exchangeTelegramAuthFromWebApp).not.toHaveBeenCalled();
  });
});
