function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

describe('fetchApiJson', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_API_BASE_URL = 'https://api.example.com';
    vi.resetModules();
    vi.doMock('@/lib/auth-refresh', () => ({
      postAuthRefresh: vi.fn(async (): Promise<boolean> => false),
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('should retry request once when refresh succeeds after 401', async () => {
    const postAuthRefresh = vi.fn(async (): Promise<boolean> => true);
    vi.doMock('@/lib/auth-refresh', () => ({ postAuthRefresh }));

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ message: 'unauthorized' }, 401))
      .mockResolvedValueOnce(jsonResponse({ gigs: [] }, 200));

    vi.stubGlobal('fetch', fetchMock);

    const { fetchApiJson } = await import('@/lib/api-core');
    const result = await fetchApiJson<{ gigs: unknown[] }>('v1/gig?limit=10', 'GET');

    expect(result).toEqual({ gigs: [] });
    expect(postAuthRefresh).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should throw ApiError with 401 status when request is still unauthorized after refresh retry', async () => {
    const postAuthRefresh = vi.fn(async (): Promise<boolean> => true);
    vi.doMock('@/lib/auth-refresh', () => ({ postAuthRefresh }));

    const onUnauthorized = vi.fn();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ message: 'unauthorized' }, 401))
      .mockResolvedValueOnce(jsonResponse({ message: 'still unauthorized' }, 401));

    vi.stubGlobal('fetch', fetchMock);

    const { fetchApiJson } = await import('@/lib/api-core');

    await expect(
      fetchApiJson('v1/gig?limit=10', 'GET', undefined, { onUnauthorized }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      statusCode: 401,
    });
    expect(postAuthRefresh).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should call onUnauthorized once when second request is still unauthorized', async () => {
    const postAuthRefresh = vi.fn(async (): Promise<boolean> => true);
    vi.doMock('@/lib/auth-refresh', () => ({ postAuthRefresh }));

    const onUnauthorized = vi.fn();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ message: 'unauthorized' }, 401))
      .mockResolvedValueOnce(jsonResponse({ message: 'still unauthorized' }, 401));

    vi.stubGlobal('fetch', fetchMock);
    const { fetchApiJson } = await import('@/lib/api-core');

    const action = fetchApiJson('v1/gig?limit=10', 'GET', undefined, { onUnauthorized });

    await expect(action).rejects.toThrow();
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('should not trigger refresh flow when endpoint is auth refresh itself', async () => {
    const postAuthRefresh = vi.fn(async (): Promise<boolean> => true);
    vi.doMock('@/lib/auth-refresh', () => ({ postAuthRefresh }));

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ message: 'unauthorized' }, 401));

    vi.stubGlobal('fetch', fetchMock);
    const { fetchApiJson } = await import('@/lib/api-core');

    const action = fetchApiJson('v1/auth/refresh', 'POST', undefined, { onUnauthorized: vi.fn() });

    await expect(action).rejects.toThrow();
    expect(postAuthRefresh).not.toHaveBeenCalled();
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

    const action = fetchApiJson('v1/auth/telegram/web-app', 'POST', { initData: 'abc' });

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

    const action = fetchApiJson('v1/gig?limit=10', 'GET');

    await expect(action).rejects.toThrow('bad gateway');
  });

  it('should remove content-type header when data is FormData', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(jsonResponse({ ok: true }, 200));
    vi.stubGlobal('fetch', fetchMock);

    const formData = new FormData();
    formData.append('file', 'demo');

    const { fetchApiJson } = await import('@/lib/api-core');

    await fetchApiJson<{ ok: boolean }>('v1/receiver/gig', 'POST', formData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const init = fetchMock.mock.calls[0]?.[1];
    const headers = new Headers(init?.headers);
    expect(headers.has('Content-Type')).toBe(false);
  });

  it('should default credentials to include when credentials option is omitted', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(jsonResponse({ ok: true }, 200));
    vi.stubGlobal('fetch', fetchMock);
    const { fetchApiJson } = await import('@/lib/api-core');

    await fetchApiJson<{ ok: boolean }>('v1/gig', 'GET');

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.credentials).toBe('include');
  });

  it('should preserve explicit credentials option when provided', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(jsonResponse({ ok: true }, 200));
    vi.stubGlobal('fetch', fetchMock);
    const { fetchApiJson } = await import('@/lib/api-core');

    await fetchApiJson<{ ok: boolean }>('v1/gig', 'GET', undefined, { credentials: 'omit' });

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.credentials).toBe('omit');
  });

  it('should not send request body when method is GET', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(jsonResponse({ gigs: [] }, 200));
    vi.stubGlobal('fetch', fetchMock);
    const { fetchApiJson } = await import('@/lib/api-core');

    await fetchApiJson<{ gigs: unknown[] }>('v1/gig', 'GET', { ignored: true });

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.body).toBeUndefined();
  });

  it('should set json content-type when body is plain object and header is not provided', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(jsonResponse({ ok: true }, 200));
    vi.stubGlobal('fetch', fetchMock);
    const { fetchApiJson } = await import('@/lib/api-core');

    await fetchApiJson<{ ok: boolean }>('v1/gig/lookup', 'POST', { name: 'test' });

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
      { onUnauthorized },
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

    const action = fetchApiJson('v1/gig?limit=10', 'GET', undefined, { onUnauthorized });

    await expect(action).rejects.toThrow('forbidden');
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it('should throw fallback message when json error payload has empty message', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ message: '' }, 400));
    vi.stubGlobal('fetch', fetchMock);
    const { fetchApiJson } = await import('@/lib/api-core');

    const action = fetchApiJson('v1/gig/lookup', 'POST', { name: 'x' });

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

    const action = fetchApiJson('v1/gig', 'GET');

    await expect(action).rejects.toThrow('Something went wrong');
  });
});
