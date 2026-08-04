import { apiPublicRequest, apiRequest } from '@/lib/api';

const { fetchApiJsonWithSessionRecoveryMock } = vi.hoisted(() => ({
  fetchApiJsonWithSessionRecoveryMock: vi.fn(),
}));

const { fetchApiJsonMock } = vi.hoisted(() => ({
  fetchApiJsonMock: vi.fn(),
}));

vi.mock('@/lib/api-session-recovery', () => ({
  fetchApiJsonWithSessionRecovery: fetchApiJsonWithSessionRecoveryMock,
}));

vi.mock('@/lib/api-core', () => ({
  fetchApiJson: fetchApiJsonMock,
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    errorFromUnknown: vi.fn(),
  },
}));

describe('apiRequest', () => {
  beforeEach(() => {
    fetchApiJsonWithSessionRecoveryMock.mockReset();
    fetchApiJsonWithSessionRecoveryMock.mockResolvedValue({ ok: true });
  });

  it('should delegate to session recovery coordinator without onUnauthorized', async () => {
    await apiRequest('v1/admin/dashboard', 'GET');

    expect(fetchApiJsonWithSessionRecoveryMock).toHaveBeenCalledWith(
      'v1/admin/dashboard',
      'GET',
      undefined,
      expect.objectContaining({
        init: expect.objectContaining({
          headers: expect.any(Headers),
        }),
      }),
    );

    const options = fetchApiJsonWithSessionRecoveryMock.mock.calls[0]?.[3] as {
      onUnauthorized?: () => void;
    };
    expect(options.onUnauthorized).toBeUndefined();
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
