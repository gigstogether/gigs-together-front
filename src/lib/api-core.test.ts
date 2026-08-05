function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

const INCLUDE_CREDENTIALS = { credentials: 'include' as const };
const OMIT_CREDENTIALS = { credentials: 'omit' as const };

describe('buildUrl', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_API_BASE_URL = 'https://api.example.com';
    vi.resetModules();
  });

  it('should build URL from a relative v1 endpoint', async () => {
    const { buildUrl } = await import('@/lib/api-core');

    expect(buildUrl('v1/gig?limit=10')).toBe('https://api.example.com/v1/gig?limit=10');
  });

  it('should normalize a leading slash on v1 endpoint', async () => {
    const { buildUrl } = await import('@/lib/api-core');

    expect(buildUrl('/v1/location/countries')).toBe(
      'https://api.example.com/v1/location/countries',
    );
  });

  it('should throw when endpoint is an absolute URL', async () => {
    const { buildUrl } = await import('@/lib/api-core');

    expect(() => buildUrl('https://evil.com/v1/gig')).toThrow(
      'API endpoint must be a relative path under v1/, got: https://evil.com/v1/gig',
    );
  });

  it('should throw when endpoint uses a protocol-relative URL', async () => {
    const { buildUrl } = await import('@/lib/api-core');

    expect(() => buildUrl('//evil.com/v1/gig')).toThrow(
      'API endpoint must be a relative path under v1/, got: //evil.com/v1/gig',
    );
  });

  it('should throw when endpoint contains path traversal', async () => {
    const { buildUrl } = await import('@/lib/api-core');

    expect(() => buildUrl('v1/../admin/dashboard')).toThrow(
      'API endpoint must not contain "..", got: v1/../admin/dashboard',
    );
  });

  it('should throw when endpoint is not under v1', async () => {
    const { buildUrl } = await import('@/lib/api-core');

    expect(() => buildUrl('admin/dashboard')).toThrow(
      'API endpoint must start with "v1/", got: admin/dashboard',
    );
  });

  it('should throw when API base URL is missing', async () => {
    delete process.env.NEXT_PUBLIC_APP_API_BASE_URL;
    vi.resetModules();

    const { buildUrl } = await import('@/lib/api-core');

    expect(() => buildUrl('v1/gig')).toThrow(
      'Missing NEXT_PUBLIC_APP_API_BASE_URL for direct API calls',
    );
  });
});

describe('fetchApiJson', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_API_BASE_URL = 'https://api.example.com';
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('should throw ApiError on 401 without making a second request', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ message: 'unauthorized' }, 401));
    vi.stubGlobal('fetch', fetchMock);

    const { fetchApiJson } = await import('@/lib/api-core');

    await expect(
      fetchApiJson('v1/gig?limit=10', 'GET', undefined, OMIT_CREDENTIALS),
    ).rejects.toMatchObject({
      name: 'ApiError',
      statusCode: 401,
    });
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
      INCLUDE_CREDENTIALS,
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

    const action = fetchApiJson('v1/gig?limit=10', 'GET', undefined, OMIT_CREDENTIALS);

    await expect(action).rejects.toThrow('bad gateway');
  });

  it('should remove content-type header when data is FormData', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(jsonResponse({ ok: true }, 200));
    vi.stubGlobal('fetch', fetchMock);

    const formData = new FormData();
    formData.append('file', 'demo');

    const { fetchApiJson } = await import('@/lib/api-core');

    await fetchApiJson<{ ok: boolean }>('v1/receiver/gig', 'POST', formData, {
      ...INCLUDE_CREDENTIALS,
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

    await fetchApiJson<{ ok: boolean }>('v1/gig', 'GET', undefined, OMIT_CREDENTIALS);

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.credentials).toBe('omit');
  });

  it('should send include credentials when credentials option is include', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(jsonResponse({ ok: true }, 200));
    vi.stubGlobal('fetch', fetchMock);
    const { fetchApiJson } = await import('@/lib/api-core');

    await fetchApiJson<{ ok: boolean }>('v1/gig', 'GET', undefined, INCLUDE_CREDENTIALS);

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.credentials).toBe('include');
  });

  it('should not send request body when method is GET', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(jsonResponse({ gigs: [] }, 200));
    vi.stubGlobal('fetch', fetchMock);
    const { fetchApiJson } = await import('@/lib/api-core');

    await fetchApiJson<{ gigs: unknown[] }>('v1/gig', 'GET', { ignored: true }, OMIT_CREDENTIALS);

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
      INCLUDE_CREDENTIALS,
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
        ...INCLUDE_CREDENTIALS,
        headers: {
          'Content-Type': 'application/merge-patch+json',
        },
      },
    );

    const init = fetchMock.mock.calls[0]?.[1];
    const headers = new Headers(init?.headers);
    expect(headers.get('Content-Type')).toBe('application/merge-patch+json');
  });

  it('should throw fallback message when json error payload has empty message', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ message: '' }, 400));
    vi.stubGlobal('fetch', fetchMock);
    const { fetchApiJson } = await import('@/lib/api-core');

    const action = fetchApiJson('v1/gig/lookup', 'POST', { name: 'x' }, INCLUDE_CREDENTIALS);

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

    const action = fetchApiJson('v1/gig', 'GET', undefined, OMIT_CREDENTIALS);

    await expect(action).rejects.toThrow('Something went wrong');
  });
});

export {};
