function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

const { postAuthRefreshMock } = vi.hoisted(() => ({
  postAuthRefreshMock: vi.fn<() => Promise<boolean>>(),
}));

const { loggerErrorFromUnknownMock } = vi.hoisted(() => ({
  loggerErrorFromUnknownMock: vi.fn(),
}));

const { getTelegramInitDataMock, isTelegramMiniAppMock } = vi.hoisted(() => ({
  getTelegramInitDataMock: vi.fn<() => string>(),
  isTelegramMiniAppMock: vi.fn<() => boolean>(),
}));

const { exchangeTelegramAuthFromWebAppMock, hasExplicitTelegramSignInMock } = vi.hoisted(() => ({
  exchangeTelegramAuthFromWebAppMock: vi.fn<(initData: string) => Promise<void>>(),
  hasExplicitTelegramSignInMock: vi.fn<() => boolean>(),
}));

vi.mock('@/lib/auth-refresh', () => ({
  postAuthRefresh: postAuthRefreshMock,
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    errorFromUnknown: loggerErrorFromUnknownMock,
  },
}));

vi.mock('@/lib/telegram/telegram-webapp', () => ({
  getTelegramInitData: getTelegramInitDataMock,
  isTelegramMiniApp: isTelegramMiniAppMock,
}));

vi.mock('@/lib/telegram/telegram-auth', () => ({
  exchangeTelegramAuthFromWebApp: exchangeTelegramAuthFromWebAppMock,
  hasExplicitTelegramSignIn: hasExplicitTelegramSignInMock,
}));

describe('fetchApiJsonWithSessionRecovery', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_API_BASE_URL = 'https://api.example.com';
    vi.resetModules();
    postAuthRefreshMock.mockReset();
    postAuthRefreshMock.mockResolvedValue(false);
    loggerErrorFromUnknownMock.mockReset();
    isTelegramMiniAppMock.mockReset();
    isTelegramMiniAppMock.mockReturnValue(false);
    getTelegramInitDataMock.mockReset();
    exchangeTelegramAuthFromWebAppMock.mockReset();
    exchangeTelegramAuthFromWebAppMock.mockResolvedValue();
    hasExplicitTelegramSignInMock.mockReset();
    hasExplicitTelegramSignInMock.mockReturnValue(false);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('should retry request once when refresh succeeds after 401', async () => {
    postAuthRefreshMock.mockResolvedValue(true);

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ message: 'unauthorized' }, 401))
      .mockResolvedValueOnce(jsonResponse({ gigs: [] }, 200));

    vi.stubGlobal('fetch', fetchMock);

    const { fetchApiJsonWithSessionRecovery } = await import('@/lib/api-session-recovery');
    const result = await fetchApiJsonWithSessionRecovery<{ gigs: unknown[] }>(
      'v1/gig?limit=10',
      'GET',
      undefined,
      {},
    );

    expect(result).toEqual({ gigs: [] });
    expect(postAuthRefreshMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should throw ApiError with 401 status when request is still unauthorized after refresh retry', async () => {
    postAuthRefreshMock.mockResolvedValue(true);

    const onUnauthorized = vi.fn();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ message: 'unauthorized' }, 401))
      .mockResolvedValueOnce(jsonResponse({ message: 'still unauthorized' }, 401));

    vi.stubGlobal('fetch', fetchMock);

    const { fetchApiJsonWithSessionRecovery } = await import('@/lib/api-session-recovery');

    await expect(
      fetchApiJsonWithSessionRecovery('v1/gig?limit=10', 'GET', undefined, { onUnauthorized }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      statusCode: 401,
    });
    expect(postAuthRefreshMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should call onUnauthorized once when second request is still unauthorized', async () => {
    postAuthRefreshMock.mockResolvedValue(true);

    const onUnauthorized = vi.fn();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ message: 'unauthorized' }, 401))
      .mockResolvedValueOnce(jsonResponse({ message: 'still unauthorized' }, 401));

    vi.stubGlobal('fetch', fetchMock);
    const { fetchApiJsonWithSessionRecovery } = await import('@/lib/api-session-recovery');

    const action = fetchApiJsonWithSessionRecovery('v1/gig?limit=10', 'GET', undefined, {
      onUnauthorized,
    });

    await expect(action).rejects.toThrow();
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('should not trigger refresh flow when endpoint is auth refresh itself', async () => {
    postAuthRefreshMock.mockResolvedValue(true);

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ message: 'unauthorized' }, 401));

    vi.stubGlobal('fetch', fetchMock);
    const { fetchApiJsonWithSessionRecovery } = await import('@/lib/api-session-recovery');

    const action = fetchApiJsonWithSessionRecovery('v1/auth/refresh', 'POST', undefined, {
      onUnauthorized: vi.fn(),
    });

    await expect(action).rejects.toThrow();
    expect(postAuthRefreshMock).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should retry request after Telegram Mini App re-auth succeeds when token refresh fails', async () => {
    postAuthRefreshMock.mockResolvedValue(false);
    hasExplicitTelegramSignInMock.mockReturnValue(true);
    isTelegramMiniAppMock.mockReturnValue(true);
    getTelegramInitDataMock.mockReturnValue('init-data');

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ message: 'unauthorized' }, 401))
      .mockResolvedValueOnce(jsonResponse({ gigs: [] }, 200));

    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('window', {});

    const { fetchApiJsonWithSessionRecovery } = await import('@/lib/api-session-recovery');

    const result = await fetchApiJsonWithSessionRecovery<{ gigs: unknown[] }>(
      'v1/gig?limit=10',
      'GET',
      undefined,
      {},
    );

    expect(result).toEqual({ gigs: [] });
    expect(postAuthRefreshMock).toHaveBeenCalledTimes(1);
    expect(isTelegramMiniAppMock).toHaveBeenCalledTimes(1);
    expect(getTelegramInitDataMock).toHaveBeenCalledTimes(1);
    expect(exchangeTelegramAuthFromWebAppMock).toHaveBeenCalledWith('init-data');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should finish unauthorized flow when Telegram Mini App re-auth fails', async () => {
    const onUnauthorized = vi.fn();
    hasExplicitTelegramSignInMock.mockReturnValue(true);
    isTelegramMiniAppMock.mockReturnValue(true);
    getTelegramInitDataMock.mockReturnValue('init-data');
    exchangeTelegramAuthFromWebAppMock.mockRejectedValue(new Error('invalid initData'));

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ message: 'unauthorized' }, 401));

    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('window', {});

    const { fetchApiJsonWithSessionRecovery } = await import('@/lib/api-session-recovery');

    const action = fetchApiJsonWithSessionRecovery('v1/admin/dashboard', 'GET', undefined, {
      onUnauthorized,
    });

    await expect(action).rejects.toMatchObject({
      name: 'ApiError',
      statusCode: 401,
    });
    expect(exchangeTelegramAuthFromWebAppMock).toHaveBeenCalledWith('init-data');
    expect(loggerErrorFromUnknownMock).toHaveBeenCalledWith(
      'telegram_mini_app_reauth_failed',
      expect.any(Error),
    );
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should not repeat recovery after request stays unauthorized following Mini App re-auth', async () => {
    const onUnauthorized = vi.fn();
    hasExplicitTelegramSignInMock.mockReturnValue(true);
    isTelegramMiniAppMock.mockReturnValue(true);
    getTelegramInitDataMock.mockReturnValue('init-data');

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ message: 'unauthorized' }, 401))
      .mockResolvedValueOnce(jsonResponse({ message: 'still unauthorized' }, 401));

    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('window', {});

    const { fetchApiJsonWithSessionRecovery } = await import('@/lib/api-session-recovery');

    const action = fetchApiJsonWithSessionRecovery('v1/admin/dashboard', 'GET', undefined, {
      onUnauthorized,
    });

    await expect(action).rejects.toMatchObject({
      name: 'ApiError',
      statusCode: 401,
    });
    expect(postAuthRefreshMock).toHaveBeenCalledTimes(1);
    expect(exchangeTelegramAuthFromWebAppMock).toHaveBeenCalledTimes(1);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should not authenticate a Mini App guest after token refresh fails', async () => {
    const onUnauthorized = vi.fn();
    isTelegramMiniAppMock.mockReturnValue(true);
    getTelegramInitDataMock.mockReturnValue('init-data');

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ message: 'unauthorized' }, 401));

    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('window', {});

    const { fetchApiJsonWithSessionRecovery } = await import('@/lib/api-session-recovery');

    const action = fetchApiJsonWithSessionRecovery('v1/gig?limit=10', 'GET', undefined, {
      onUnauthorized,
    });

    await expect(action).rejects.toMatchObject({
      name: 'ApiError',
      statusCode: 401,
    });
    expect(postAuthRefreshMock).toHaveBeenCalledTimes(1);
    expect(isTelegramMiniAppMock).not.toHaveBeenCalled();
    expect(getTelegramInitDataMock).not.toHaveBeenCalled();
    expect(exchangeTelegramAuthFromWebAppMock).not.toHaveBeenCalled();
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should call onUnauthorized on final 401 and skip Telegram re-auth for web-app auth endpoint', async () => {
    const onUnauthorized = vi.fn();
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      jsonResponse(
        {
          message: 'unauthorized',
          code: 'X',
        },
        401,
      ),
    );
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('window', {});
    isTelegramMiniAppMock.mockReturnValue(true);
    getTelegramInitDataMock.mockReturnValue('init-data');

    const { fetchApiJsonWithSessionRecovery } = await import('@/lib/api-session-recovery');

    const action = fetchApiJsonWithSessionRecovery(
      'v1/auth/telegram/web-app',
      'POST',
      { initData: 'x' },
      { onUnauthorized },
    );

    await expect(action).rejects.toThrow();
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(isTelegramMiniAppMock).not.toHaveBeenCalled();
    expect(getTelegramInitDataMock).not.toHaveBeenCalled();
  });

  it('should not call onUnauthorized when response status is not 401', async () => {
    const onUnauthorized = vi.fn();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ message: 'forbidden' }, 403));
    vi.stubGlobal('fetch', fetchMock);
    const { fetchApiJsonWithSessionRecovery } = await import('@/lib/api-session-recovery');

    const action = fetchApiJsonWithSessionRecovery('v1/gig?limit=10', 'GET', undefined, {
      onUnauthorized,
    });

    await expect(action).rejects.toThrow('forbidden');
    expect(onUnauthorized).not.toHaveBeenCalled();
  });
});
