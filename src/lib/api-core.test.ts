function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

const SESSION_CREDENTIALS = { credentials: 'include' as const };
const PUBLIC_CREDENTIALS = { credentials: 'omit' as const };

const { postAuthRefreshMock } = vi.hoisted(() => ({
  postAuthRefreshMock: vi.fn<() => Promise<boolean>>(),
}));

vi.mock('@/lib/auth-refresh', () => ({
  postAuthRefresh: postAuthRefreshMock,
}));

describe('fetchApiJson', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_API_BASE_URL = 'https://api.example.com';
    vi.resetModules();
    postAuthRefreshMock.mockReset();
    postAuthRefreshMock.mockResolvedValue(false);
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

    const { fetchApiJson } = await import('@/lib/api-core');
    const result = await fetchApiJson<{ gigs: unknown[] }>(
      'v1/gig?limit=10',
      'GET',
      undefined,
      SESSION_CREDENTIALS,
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

    const { fetchApiJson } = await import('@/lib/api-core');

    await expect(
      fetchApiJson('v1/gig?limit=10', 'GET', undefined, {
        ...SESSION_CREDENTIALS,
        onUnauthorized,
      }),
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
    const { fetchApiJson } = await import('@/lib/api-core');

    const action = fetchApiJson('v1/gig?limit=10', 'GET', undefined, {
      ...SESSION_CREDENTIALS,
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
    const { fetchApiJson } = await import('@/lib/api-core');

    const action = fetchApiJson('v1/auth/refresh', 'POST', undefined, {
      ...SESSION_CREDENTIALS,
      onUnauthorized: vi.fn(),
    });

    await expect(action).rejects.toThrow();
    expect(postAuthRefreshMock).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should propagate machine-readable error code when backend provides it', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      jsonResponse(
        {
          message: 'expired',
          code: 'TELEGRAM_INIT_DATA_EXPIRED',
        },
        401,
      ),
    );

    vi.stubGlobal('fetch', fetchMock);
    const { fetchApiJson } = await import('@/lib/api-core');

    const action = fetchApiJson(
      'v1/auth/telegram/web-app',
      'POST',
      { initData: 'abc' },
      SESSION_CREDENTIALS,
    );

    await expect(action).rejects.toMatchObject({
      name: 'ApiError',
      message: 'expired',
      code: 'TELEGRAM_INIT_DATA_EXPIRED',
      statusCode: 401,
    });
  });

  it('should use plain text response body as error message when response is non-json', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      new Response('bad gateway', {
        status: 502,
        headers: {
          'Content-Type': 'text/plain',
        },
      }),
    );

    vi.stubGlobal('fetch', fetchMock);
    const { fetchApiJson } = await import('@/lib/api-core');

    const action = fetchApiJson('v1/gig?limit=10', 'GET', undefined, PUBLIC_CREDENTIALS);

    await expect(action).rejects.toThrow('bad gateway');
  });

  it('should remove content-type header when data is FormData', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(jsonResponse({ ok: true }, 200));
    vi.stubGlobal('fetch', fetchMock);

    const formData = new FormData();
    formData.append('file', 'demo');

    const { fetchApiJson } = await import('@/lib/api-core');

    await fetchApiJson<{ ok: boolean }>('v1/receiver/gig', 'POST', formData, {
      ...SESSION_CREDENTIALS,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const init = fetchMock.mock.calls[0]?.[1];
    const headers = new Headers(init?.headers);
    expect(headers.has('Content-Type')).toBe(false);
  });

  it('should send omit credentials when credentials option is omit', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(jsonResponse({ ok: true }, 200));
    vi.stubGlobal('fetch', fetchMock);
    const { fetchApiJson } = await import('@/lib/api-core');

    await fetchApiJson<{ ok: boolean }>('v1/gig', 'GET', undefined, PUBLIC_CREDENTIALS);

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.credentials).toBe('omit');
  });

  it('should send include credentials when credentials option is include', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(jsonResponse({ ok: true }, 200));
    vi.stubGlobal('fetch', fetchMock);
    const { fetchApiJson } = await import('@/lib/api-core');

    await fetchApiJson<{ ok: boolean }>('v1/gig', 'GET', undefined, SESSION_CREDENTIALS);

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.credentials).toBe('include');
  });

  it('should not send request body when method is GET', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(jsonResponse({ gigs: [] }, 200));
    vi.stubGlobal('fetch', fetchMock);
    const { fetchApiJson } = await import('@/lib/api-core');

    await fetchApiJson<{ gigs: unknown[] }>('v1/gig', 'GET', { ignored: true }, PUBLIC_CREDENTIALS);

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.body).toBeUndefined();
  });

  it('should set json content-type when body is plain object and header is not provided', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(jsonResponse({ ok: true }, 200));
    vi.stubGlobal('fetch', fetchMock);
    const { fetchApiJson } = await import('@/lib/api-core');

    await fetchApiJson<{ ok: boolean }>(
      'v1/gig/lookup',
      'POST',
      { name: 'test' },
      SESSION_CREDENTIALS,
    );

    const init = fetchMock.mock.calls[0]?.[1];
    const headers = new Headers(init?.headers);
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('should keep existing content-type when header is provided explicitly', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(jsonResponse({ ok: true }, 200));
    vi.stubGlobal('fetch', fetchMock);
    const { fetchApiJson } = await import('@/lib/api-core');

    await fetchApiJson<{ ok: boolean }>(
      'v1/gig/lookup',
      'POST',
      { name: 'test' },
      {
        ...SESSION_CREDENTIALS,
        headers: {
          'Content-Type': 'application/merge-patch+json',
        },
      },
    );

    const init = fetchMock.mock.calls[0]?.[1];
    const headers = new Headers(init?.headers);
    expect(headers.get('Content-Type')).toBe('application/merge-patch+json');
  });

  it('should call onUnauthorized when response is 401 and no refresh retry is attempted', async () => {
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
    const { fetchApiJson } = await import('@/lib/api-core');

    const action = fetchApiJson(
      'v1/auth/telegram/web-app',
      'POST',
      { initData: 'x' },
      { ...SESSION_CREDENTIALS, onUnauthorized },
    );

    await expect(action).rejects.toThrow();
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('should not call onUnauthorized when response status is not 401', async () => {
    const onUnauthorized = vi.fn();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ message: 'forbidden' }, 403));
    vi.stubGlobal('fetch', fetchMock);
    const { fetchApiJson } = await import('@/lib/api-core');

    const action = fetchApiJson('v1/gig?limit=10', 'GET', undefined, {
      ...SESSION_CREDENTIALS,
      onUnauthorized,
    });

    await expect(action).rejects.toThrow('forbidden');
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it('should throw fallback message when json error payload has empty message', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ message: '' }, 400));
    vi.stubGlobal('fetch', fetchMock);
    const { fetchApiJson } = await import('@/lib/api-core');

    const action = fetchApiJson('v1/gig/lookup', 'POST', { name: 'x' }, SESSION_CREDENTIALS);

    await expect(action).rejects.toThrow('Something went wrong');
  });

  it('should throw default error message when json body is primitive value', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      new Response('42', {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const { fetchApiJson } = await import('@/lib/api-core');

    const action = fetchApiJson('v1/gig', 'GET', undefined, PUBLIC_CREDENTIALS);

    await expect(action).rejects.toThrow('Something went wrong');
  });
});
