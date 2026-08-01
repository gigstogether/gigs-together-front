import { apiPublicRequest, apiRequest } from '@/lib/api';

const { fetchApiJsonMock } = vi.hoisted(() => ({
  fetchApiJsonMock: vi.fn(),
}));

const { clearStoredTelegramClientProfileMock, requestTelegramSignInMock } = vi.hoisted(() => ({
  clearStoredTelegramClientProfileMock: vi.fn(),
  requestTelegramSignInMock: vi.fn(),
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
    fetchApiJsonMock.mockReset();
    clearStoredTelegramClientProfileMock.mockReset();
    requestTelegramSignInMock.mockReset();
    fetchApiJsonMock.mockResolvedValue({ ok: true });
  });

  it('should call fetchApiJson with include credentials and onUnauthorized', async () => {
    await apiRequest('v1/admin/dashboard', 'GET');

    expect(fetchApiJsonMock).toHaveBeenCalledWith(
      'v1/admin/dashboard',
      'GET',
      undefined,
      expect.objectContaining({
        credentials: 'include',
        onUnauthorized: expect.any(Function),
      }),
    );
  });

  it('should trigger sign-in recovery when onUnauthorized runs', async () => {
    await apiRequest('v1/admin/dashboard', 'GET');

    const init = fetchApiJsonMock.mock.calls[0]?.[3] as {
      onUnauthorized?: () => void;
    };
    init.onUnauthorized?.();

    expect(clearStoredTelegramClientProfileMock).toHaveBeenCalledTimes(1);
    expect(requestTelegramSignInMock).toHaveBeenCalledTimes(1);
  });
});

describe('apiPublicRequest', () => {
  beforeEach(() => {
    fetchApiJsonMock.mockReset();
    clearStoredTelegramClientProfileMock.mockReset();
    requestTelegramSignInMock.mockReset();
    fetchApiJsonMock.mockResolvedValue({ ok: true });
  });

  it('should call fetchApiJson with omit credentials and without onUnauthorized', async () => {
    await apiPublicRequest('v1/gig?limit=10', 'GET');

    expect(fetchApiJsonMock).toHaveBeenCalledWith(
      'v1/gig?limit=10',
      'GET',
      undefined,
      expect.objectContaining({
        credentials: 'omit',
      }),
    );

    const init = fetchApiJsonMock.mock.calls[0]?.[3] as Record<string, unknown>;
    expect(init.onUnauthorized).toBeUndefined();
  });
});
