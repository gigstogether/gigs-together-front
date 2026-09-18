import { apiClientRequest, handleApiClientSessionUnauthorized } from '@/lib/api-session-client';

const { fetchApiJsonWithSessionRecoveryMock, loggerErrorFromUnknownMock } = vi.hoisted(() => ({
  fetchApiJsonWithSessionRecoveryMock: vi.fn(),
  loggerErrorFromUnknownMock: vi.fn(),
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
    errorFromUnknown: loggerErrorFromUnknownMock,
  },
}));

describe('apiClientRequest', () => {
  beforeEach(() => {
    fetchApiJsonWithSessionRecoveryMock.mockReset();
    clearStoredTelegramClientProfileMock.mockReset();
    requestTelegramSignInMock.mockReset();
    loggerErrorFromUnknownMock.mockReset();
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

  it('should rethrow an aborted request without logging an error', async () => {
    const abortError = new DOMException('This operation was aborted', 'AbortError');
    fetchApiJsonWithSessionRecoveryMock.mockRejectedValue(abortError);

    const request = apiClientRequest('v1/admin/dashboard', 'GET');

    await expect(request).rejects.toBe(abortError);
    expect(loggerErrorFromUnknownMock).not.toHaveBeenCalled();
  });

  it('should log and rethrow a request failure', async () => {
    const requestError = new TypeError('Failed to fetch');
    fetchApiJsonWithSessionRecoveryMock.mockRejectedValue(requestError);

    const request = apiClientRequest('v1/admin/dashboard', 'GET');

    await expect(request).rejects.toBe(requestError);
    expect(loggerErrorFromUnknownMock).toHaveBeenCalledWith(
      'api_client_request_failed',
      requestError,
      {
        endpointOrUrl: 'v1/admin/dashboard',
        method: 'GET',
      },
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
