const { fetchApiJsonMock, loggerErrorFromUnknownMock } = vi.hoisted(() => ({
  fetchApiJsonMock: vi.fn(),
  loggerErrorFromUnknownMock: vi.fn(),
}));

vi.mock('@/lib/api-core', () => ({
  fetchApiJson: fetchApiJsonMock,
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    errorFromUnknown: loggerErrorFromUnknownMock,
  },
}));

describe('apiPublicRequest', () => {
  beforeEach(() => {
    fetchApiJsonMock.mockReset();
    loggerErrorFromUnknownMock.mockReset();
    fetchApiJsonMock.mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should call pure transport with omit credentials', async () => {
    const { apiPublicRequest } = await import('@/lib/api-public');

    await apiPublicRequest('v1/gig?limit=10', 'GET');

    expect(fetchApiJsonMock).toHaveBeenCalledWith(
      'v1/gig?limit=10',
      'GET',
      undefined,
      expect.objectContaining({
        credentials: 'omit',
      }),
    );
  });

  it('should rethrow an aborted request without logging an error', async () => {
    const abortError = new DOMException('This operation was aborted', 'AbortError');
    fetchApiJsonMock.mockRejectedValue(abortError);
    const { apiPublicRequest } = await import('@/lib/api-public');

    const request = apiPublicRequest('v1/gigs?limit=10', 'GET');

    await expect(request).rejects.toBe(abortError);
    expect(loggerErrorFromUnknownMock).not.toHaveBeenCalled();
  });

  it('should add HTTP status and endpoint to a server request error', async () => {
    const { ApiError } = await import('@/lib/api-errors');
    const responseError = new ApiError('Something went wrong', 502);
    fetchApiJsonMock.mockRejectedValue(responseError);
    const { apiPublicRequest } = await import('@/lib/api-public');

    const request = apiPublicRequest('/v1/location/countries', 'GET');

    await expect(request).rejects.toMatchObject({
      name: 'ApiRequestError',
      message: 'HTTP 502 GET /v1/location/countries: Something went wrong',
      endpointOrUrl: '/v1/location/countries',
      method: 'GET',
      statusCode: 502,
    });
  });

  it('should omit the original error cause from a server request error', async () => {
    const { ApiError } = await import('@/lib/api-errors');
    fetchApiJsonMock.mockRejectedValue(new ApiError('Something went wrong', 502));
    const { apiPublicRequest } = await import('@/lib/api-public');

    const request = apiPublicRequest('/v1/location/countries', 'GET');

    await expect(request).rejects.not.toHaveProperty('cause');
  });

  it('should not log a server request failure before rethrowing it', async () => {
    fetchApiJsonMock.mockRejectedValue(new TypeError('Failed to fetch'));
    const { apiPublicRequest } = await import('@/lib/api-public');

    await expect(apiPublicRequest('v1/gigs?limit=10', 'GET')).rejects.toThrow();
    expect(loggerErrorFromUnknownMock).not.toHaveBeenCalled();
  });

  it('should log a browser request failure before rethrowing it', async () => {
    vi.stubGlobal('window', {});
    const requestError = new TypeError('Failed to fetch');
    fetchApiJsonMock.mockRejectedValue(requestError);
    const { apiPublicRequest } = await import('@/lib/api-public');

    const request = apiPublicRequest('v1/gigs?limit=10', 'GET');

    await expect(request).rejects.toBe(requestError);
    expect(loggerErrorFromUnknownMock).toHaveBeenCalledWith(
      'api_public_request_failed',
      requestError,
      {
        endpointOrUrl: 'v1/gigs?limit=10',
        method: 'GET',
      },
    );
  });
});

export {};
