import { apiClientRequest, handleApiClientSessionUnauthorized } from '@/lib/api-session-client';

const { fetchApiJsonWithSessionRecoveryMock } = vi.hoisted(() => ({
  fetchApiJsonWithSessionRecoveryMock: vi.fn(),
}));

const { clearStoredTelegramClientProfileMock, requestTelegramSignInMock } = vi.hoisted(() => ({
  clearStoredTelegramClientProfileMock: vi.fn(),
  requestTelegramSignInMock: vi.fn(),
}));

vi.mock('@/lib/api-session-recovery', () => ({
  fetchApiJsonWithSessionRecovery: fetchApiJsonWithSessionRecoveryMock,
}));

vi.mock('@/lib/telegram/telegram-auth', () => ({
  clearStoredTelegramClientProfile: clearStoredTelegramClientProfileMock,
  requestTelegramSignIn: requestTelegramSignInMock,
}));

vi.mock('@/lib/telegram/telegram-webapp', () => ({
  isTelegramMiniApp: () => false,
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    errorFromUnknown: vi.fn(),
  },
}));

describe('apiClientRequest', () => {
  beforeEach(() => {
    fetchApiJsonWithSessionRecoveryMock.mockReset();
    clearStoredTelegramClientProfileMock.mockReset();
    requestTelegramSignInMock.mockReset();
    fetchApiJsonWithSessionRecoveryMock.mockResolvedValue({ ok: true });
  });

  it('should delegate to session recovery coordinator with onUnauthorized callback', async () => {
    await apiClientRequest('v1/admin/dashboard', 'GET');

    expect(fetchApiJsonWithSessionRecoveryMock).toHaveBeenCalledWith(
      'v1/admin/dashboard',
      'GET',
      undefined,
      expect.objectContaining({
        onUnauthorized: handleApiClientSessionUnauthorized,
      }),
    );
  });
});

describe('handleApiClientSessionUnauthorized', () => {
  beforeEach(() => {
    clearStoredTelegramClientProfileMock.mockReset();
    requestTelegramSignInMock.mockReset();
  });

  it('should clear stored profile and request sign-in when not in Telegram Mini App', () => {
    handleApiClientSessionUnauthorized();

    expect(clearStoredTelegramClientProfileMock).toHaveBeenCalledTimes(1);
    expect(requestTelegramSignInMock).toHaveBeenCalledTimes(1);
  });
});
