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

const { isTelegramMiniAppMock, waitForTelegramInitDataMock } = vi.hoisted(() => ({
  isTelegramMiniAppMock: vi.fn<() => boolean>(),
  waitForTelegramInitDataMock: vi.fn<() => Promise<string>>(),
}));

const { exchangeTelegramAuthFromWebAppMock } = vi.hoisted(() => ({
  exchangeTelegramAuthFromWebAppMock: vi.fn<(initData: string) => Promise<void>>(),
}));

vi.mock('@/lib/auth-refresh', () => ({
  postAuthRefresh: postAuthRefreshMock,
}));

vi.mock('@/lib/telegram/telegram-webapp', () => ({
  isTelegramMiniApp: isTelegramMiniAppMock,
  waitForTelegramInitData: waitForTelegramInitDataMock,
}));

vi.mock('@/lib/telegram/telegram-auth', () => ({
  exchangeTelegramAuthFromWebApp: exchangeTelegramAuthFromWebAppMock,
}));

describe('fetchApiJsonWithSessionRecovery', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_API_BASE_URL = 'https://api.example.com';
    vi.resetModules();
    postAuthRefreshMock.mockReset();
    postAuthRefreshMock.mockResolvedValue(false);
    isTelegramMiniAppMock.mockReset();
    isTelegramMiniAppMock.mockReturnValue(false);
    waitForTelegramInitDataMock.mockReset();
    exchangeTelegramAuthFromWebAppMock.mockReset();
    exchangeTelegramAuthFromWebAppMock.mockResolvedValue();
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
    isTelegramMiniAppMock.mockReturnValue(true);
    waitForTelegramInitDataMock.mockResolvedValue('init-data');

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
    expect(waitForTelegramInitDataMock).toHaveBeenCalledTimes(1);
    expect(exchangeTelegramAuthFromWebAppMock).toHaveBeenCalledWith('init-data');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should finish unauthorized flow when Telegram Mini App re-auth fails', async () => {
    const onUnauthorized = vi.fn();
    isTelegramMiniAppMock.mockReturnValue(true);
    waitForTelegramInitDataMock.mockResolvedValue('init-data');
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
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should not repeat recovery after request stays unauthorized following Mini App re-auth', async () => {
    const onUnauthorized = vi.fn();
    isTelegramMiniAppMock.mockReturnValue(true);
    waitForTelegramInitDataMock.mockResolvedValue('init-data');

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
    waitForTelegramInitDataMock.mockResolvedValue('init-data');

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
    expect(waitForTelegramInitDataMock).not.toHaveBeenCalled();
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
