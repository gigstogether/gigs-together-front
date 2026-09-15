const PUBLIC_REQUEST_OPTIONS = { credentials: 'omit' as const };

describe('fetchApiJson HTTP semantics', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_API_BASE_URL = 'https://api.example.com';
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('should set accept header without setting content-type for a GET request', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const { fetchApiJson } = await import('@/lib/api-core');

    await fetchApiJson<{ ok: boolean }>('v1/gig', 'GET', undefined, PUBLIC_REQUEST_OPTIONS);

    const requestHeaders = new Headers(fetchMock.mock.calls[0]?.[1]?.headers);
    expect(requestHeaders.get('Accept')).toBe('application/json');
    expect(requestHeaders.get('Content-Type')).toBeNull();
  });

  it('should preserve an explicitly provided accept header', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const { fetchApiJson } = await import('@/lib/api-core');

    await fetchApiJson<{ ok: boolean }>('v1/gig', 'GET', undefined, {
      ...PUBLIC_REQUEST_OPTIONS,
      headers: { Accept: 'application/vnd.gigstogether+json' },
    });

    const requestHeaders = new Headers(fetchMock.mock.calls[0]?.[1]?.headers);
    expect(requestHeaders.get('Accept')).toBe('application/vnd.gigstogether+json');
  });

  it('should parse structured syntax suffix json error responses', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          message: 'Invalid request',
          code: 'INVALID_REQUEST',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/problem+json; charset=utf-8' },
        },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const { fetchApiJson } = await import('@/lib/api-core');

    const action = fetchApiJson('v1/gigs', 'GET', undefined, PUBLIC_REQUEST_OPTIONS);

    await expect(action).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Invalid request',
      code: 'INVALID_REQUEST',
      statusCode: 400,
    });
  });

  it('should return undefined for a 204 response without parsing a body', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      new Response(null, {
        status: 204,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const { fetchApiJson } = await import('@/lib/api-core');

    await expect(
      fetchApiJson<void>('v1/admin/gigs/demo/post', 'POST', undefined, PUBLIC_REQUEST_OPTIONS),
    ).resolves.toBeUndefined();
  });

  it('should return undefined for a HEAD response without parsing a body', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      new Response('not parsed', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const { fetchApiJson } = await import('@/lib/api-core');

    await expect(
      fetchApiJson<void>('v1/gig', 'HEAD', undefined, PUBLIC_REQUEST_OPTIONS),
    ).resolves.toBeUndefined();
  });
});

export {};
