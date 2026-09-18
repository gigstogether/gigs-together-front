describe('logger', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('should write a readable expandable error in the browser', async () => {
    vi.stubGlobal('window', {});
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const requestError = new TypeError('Failed to fetch');
    const { logger } = await import('@/lib/logger');

    logger.errorFromUnknown('api_client_request_failed', requestError, {
      endpointOrUrl: 'v1/admin/gig-candidates',
      method: 'GET',
    });

    expect(consoleError).toHaveBeenCalledWith('API client request failed: Failed to fetch', {
      endpointOrUrl: 'v1/admin/gig-candidates',
      method: 'GET',
      error: requestError,
    });
  });

  it('should log network diagnostics instead of the user-facing message', async () => {
    vi.stubGlobal('window', {});
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { ApiNetworkError } = await import('@/lib/api-errors');
    const { logger } = await import('@/lib/logger');
    const networkError = new ApiNetworkError({
      method: 'POST',
      url: 'https://api.example.com/v1/gig-candidates',
      cause: new TypeError('Failed to fetch'),
    });

    logger.errorFromUnknown('api_client_request_failed', networkError);

    expect(consoleError).toHaveBeenCalledWith(
      'API client request failed: No HTTP response received for POST https://api.example.com/v1/gig-candidates. Check that the API is running and the URL is correct. If it is, inspect the browser Network or Console panels for CORS, TLS, or mixed-content errors.',
      { error: networkError },
    );
  });

  it('should write a readable error with HTTP status on the development server', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { ApiError } = await import('@/lib/api-errors');
    const { logger } = await import('@/lib/logger');
    const responseError = new ApiError('Something went wrong', 500);

    logger.errorFromUnknown('api_public_request_failed', responseError, {
      endpointOrUrl: '/v1/locale/translations?namespaces=country',
      method: 'GET',
    });

    expect(consoleError).toHaveBeenCalledWith(
      'API public request failed (HTTP 500): Something went wrong',
      {
        endpointOrUrl: '/v1/locale/translations?namespaces=country',
        method: 'GET',
        error: responseError,
      },
    );
  });

  it('should preserve structured JSON logs outside development and the browser', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const requestError = new TypeError('Failed to fetch');
    const { logger } = await import('@/lib/logger');

    logger.errorFromUnknown('api_client_request_failed', requestError, {
      endpointOrUrl: 'v1/admin/gig-candidates',
      method: 'GET',
    });

    expect(consoleError).toHaveBeenCalledTimes(1);
    const serialized = consoleError.mock.calls[0]?.[0];
    if (typeof serialized !== 'string') {
      throw new Error('Expected the server log to be serialized as JSON.');
    }
    expect(JSON.parse(serialized)).toMatchObject({
      level: 'error',
      message: 'api_client_request_failed',
      meta: {
        endpointOrUrl: 'v1/admin/gig-candidates',
        method: 'GET',
        error: {
          name: 'TypeError',
          message: 'Failed to fetch',
        },
      },
    });
  });
});
