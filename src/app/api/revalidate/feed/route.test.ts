import { NextRequest } from 'next/server';
import { POST } from '@/app/api/revalidate/feed/route';

const getFeedRevalidateSecretOrThrowMock = vi.hoisted(() => vi.fn());
const revalidatePathMock = vi.hoisted(() => vi.fn());
const revalidateTagMock = vi.hoisted(() => vi.fn());
const getCommunitiesFreshMock = vi.hoisted(() => vi.fn());

vi.mock('@/env/server-env', () => ({
  getFeedRevalidateSecretOrThrow: getFeedRevalidateSecretOrThrowMock,
}));

vi.mock('next/cache', () => ({
  revalidatePath: revalidatePathMock,
  revalidateTag: revalidateTagMock,
}));

vi.mock('@/lib/community/community.server', () => ({
  getCommunitiesFresh: getCommunitiesFreshMock,
}));

function createRequest(params: {
  readonly secret?: string;
  readonly body?: unknown;
  readonly contentType?: string;
}): NextRequest {
  const headers: Record<string, string> = {};
  if (params.contentType !== undefined) {
    headers['content-type'] = params.contentType;
  }
  if (params.secret !== undefined) {
    headers['x-revalidate-secret'] = params.secret;
  }

  return new NextRequest('http://localhost/api/revalidate/feed', {
    method: 'POST',
    headers,
    body: params.body !== undefined ? JSON.stringify(params.body) : undefined,
  });
}

describe('POST', () => {
  beforeEach(() => {
    getFeedRevalidateSecretOrThrowMock.mockReset();
    revalidatePathMock.mockReset();
    revalidateTagMock.mockReset();
    getCommunitiesFreshMock.mockReset();
    getFeedRevalidateSecretOrThrowMock.mockReturnValue('top-secret');
    getCommunitiesFreshMock.mockResolvedValue({
      nameTranslationNamespace: 'community',
      communities: [
        {
          id: 'community-id',
          countryIso: 'ES',
          slug: 'barcelona',
          nameTranslationKey: 'barcelona.name',
          timeZone: 'Europe/Madrid',
        },
      ],
    });
  });

  it('should clear catalog and route caches when Community settings change', async () => {
    const response = await POST(
      createRequest({
        secret: 'top-secret',
        contentType: 'application/json',
        body: {
          paths: ['/feed/es/old-name', '/feed/es/new-name'],
          isCommunityCatalogChanged: true,
        },
      }),
    );
    expect(response.status).toBe(204);
    expect(revalidateTagMock).toHaveBeenCalledWith('communityCatalog', { expire: 0 });
    expect(revalidatePathMock).toHaveBeenCalledWith('/feed/es/old-name');
    expect(revalidatePathMock).toHaveBeenCalledWith('/feed/es/new-name');
    expect(revalidatePathMock).toHaveBeenCalledWith('/suggest');
    expect(revalidatePathMock).toHaveBeenCalledWith('/sitemap.xml');
  });

  it('should reject an invalid catalog flag when validating a revalidation request', async () => {
    const response = await POST(
      createRequest({
        secret: 'top-secret',
        contentType: 'application/json',
        body: { isCommunityCatalogChanged: 'yes' },
      }),
    );
    expect(response.status).toBe(400);
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it('should return 503 when feed revalidate secret is not configured', async () => {
    getFeedRevalidateSecretOrThrowMock.mockImplementation(() => {
      throw new Error('Missing FEED_REVALIDATE_SECRET');
    });

    const response = await POST(
      createRequest({
        secret: 'top-secret',
        contentType: 'application/json',
        body: { paths: ['/feed/es/barcelona'] },
      }),
    );

    expect(response.status).toBe(503);
  });

  it('should return 401 when secret header is missing or invalid', async () => {
    const response = await POST(
      createRequest({
        contentType: 'application/json',
        body: { paths: ['/feed/es/barcelona'] },
      }),
    );

    expect(response.status).toBe(401);
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it('should return 400 when request body is invalid JSON', async () => {
    const response = await POST(
      new NextRequest('http://localhost/api/revalidate/feed', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-revalidate-secret': 'top-secret',
        },
        body: '{',
      }),
    );

    expect(response.status).toBe(400);
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it('should return 400 when paths field has invalid shape', async () => {
    const response = await POST(
      createRequest({
        secret: 'top-secret',
        contentType: 'application/json',
        body: { paths: 'not-an-array' },
      }),
    );

    expect(response.status).toBe(400);
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it('should return 204 and revalidate provided paths when request is valid', async () => {
    const response = await POST(
      createRequest({
        secret: 'top-secret',
        contentType: 'application/json',
        body: { paths: ['/feed/es/barcelona'] },
      }),
    );

    expect(response.status).toBe(204);
    expect(revalidatePathMock).toHaveBeenCalledWith('/feed/es/barcelona');
  });

  it('should return 204 and revalidate default feed paths when body is omitted', async () => {
    const response = await POST(createRequest({ secret: 'top-secret' }));

    expect(response.status).toBe(204);
    expect(revalidatePathMock).toHaveBeenCalledWith('/feed/es/barcelona');
  });
});
