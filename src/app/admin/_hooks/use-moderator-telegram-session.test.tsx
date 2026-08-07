import { renderHook } from '@testing-library/react';
import { useModeratorTelegramSession } from '@/app/admin/_hooks/use-moderator-telegram-session';

const { mockClientEnv } = vi.hoisted(() => ({
  mockClientEnv: {
    telegramOidcClientId: 123456,
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

vi.mock('@/hooks/use-telegram-auth', () => ({
  useTelegramAuth: () => ({
    authState: null,
    isLoadingAuthState: false,
    hasTelegramMiniAppAuthError: false,
    signOut: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-telegram-mini-app-env', () => ({
  useTelegramMiniAppEnv: () => 'browser' as const,
}));

vi.mock('@/env/client-env', () => ({
  clientEnv: mockClientEnv,
}));

describe('useModeratorTelegramSession', () => {
  beforeEach(() => {
    mockClientEnv.telegramOidcClientId = 123456;
  });

  it('should make browser sign-in available when the OIDC client is configured', () => {
    const { result } = renderHook(() => useModeratorTelegramSession());

    expect(result.current.isTelegramSignInAvailable).toBe(true);
  });

  it('should make browser sign-in unavailable when the OIDC client is not configured', () => {
    mockClientEnv.telegramOidcClientId = 0;

    const { result } = renderHook(() => useModeratorTelegramSession());

    expect(result.current.isTelegramSignInAvailable).toBe(false);
  });
});
