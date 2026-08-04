import { apiPublicRequest, apiRequest } from '@/lib/api';

const { fetchApiJsonWithSessionRecoveryMock } = vi.hoisted(() => ({
  fetchApiJsonWithSessionRecoveryMock: vi.fn(),
}));

const { fetchApiJsonMock } = vi.hoisted(() => ({
  fetchApiJsonMock: vi.fn(),
}));

const { clearStoredTelegramClientProfileMock, requestTelegramSignInMock } = vi.hoisted(() => ({
  clearStoredTelegramClientProfileMock: vi.fn(),
  requestTelegramSignInMock: vi.fn(),
}));

vi.mock('@/lib/api-session-recovery', () => ({
  fetchApiJsonWithSessionRecovery: fetchApiJsonWithSessionRecoveryMock,
}));

vi.mock('@/lib/api-core', () => ({
  fetchApiJson: fetchApiJsonMock,
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

describe('apiRequest', () => {
  beforeEach(() => {
    fetchApiJsonWithSessionRecoveryMock.mockReset();
    clearStoredTelegramClientProfileMock.mockReset();
    requestTelegramSignInMock.mockReset();
    fetchApiJsonWithSessionRecoveryMock.mockResolvedValue({ ok: true });
  });

  it('should delegate to session recovery coordinator with onUnauthorized callback', async () => {
    await apiRequest('v1/admin/dashboard', 'GET');

    expect(fetchApiJsonWithSessionRecoveryMock).toHaveBeenCalledWith(
      'v1/admin/dashboard',
      'GET',
      undefined,
      expect.objectContaining({
        onUnauthorized: expect.any(Function),
      }),
    );
  });

  it('should trigger sign-in recovery when onUnauthorized runs', async () => {
    await apiRequest('v1/admin/dashboard', 'GET');

    const options = fetchApiJsonWithSessionRecoveryMock.mock.calls[0]?.[3] as {
      onUnauthorized?: () => void;
    };
    options.onUnauthorized?.();

    expect(clearStoredTelegramClientProfileMock).toHaveBeenCalledTimes(1);
    expect(requestTelegramSignInMock).toHaveBeenCalledTimes(1);
  });
});

describe('apiPublicRequest', () => {
  beforeEach(() => {
    fetchApiJsonMock.mockReset();
    fetchApiJsonWithSessionRecoveryMock.mockReset();
    fetchApiJsonMock.mockResolvedValue({ ok: true });
  });

  it('should call pure transport with omit credentials and without session recovery', async () => {
    await apiPublicRequest('v1/gig?limit=10', 'GET');

    expect(fetchApiJsonMock).toHaveBeenCalledWith(
      'v1/gig?limit=10',
      'GET',
      undefined,
      expect.objectContaining({
        credentials: 'omit',
      }),
    );
    expect(fetchApiJsonWithSessionRecoveryMock).not.toHaveBeenCalled();
  });
});
