import { NextRequest } from 'next/server';
import { POST } from '@/app/api/revalidate/translations/route';

const getTranslationsRevalidateSecretOrThrowMock = vi.hoisted(() => vi.fn());
const revalidateTagMock = vi.hoisted(() => vi.fn());
const revalidatePathMock = vi.hoisted(() => vi.fn());
const getCommunitiesFreshMock = vi.hoisted(() => vi.fn());

vi.mock('@/env/server-env', () => ({
  getTranslationsRevalidateSecretOrThrow: getTranslationsRevalidateSecretOrThrowMock,
}));

vi.mock('next/cache', () => ({
  revalidateTag: revalidateTagMock,
  revalidatePath: revalidatePathMock,
}));

vi.mock('@/lib/community/community.server', () => ({
  getCommunitiesFresh: getCommunitiesFreshMock,
}));

function createRequest(params: { readonly secret?: string; readonly body?: unknown }): NextRequest {
  return new NextRequest('http://localhost/api/revalidate/translations', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(params.secret !== undefined ? { 'x-translations-revalidate-secret': params.secret } : {}),
    },
    body: params.body !== undefined ? JSON.stringify(params.body) : undefined,
  });
}

describe('POST', () => {
  beforeEach(() => {
    getTranslationsRevalidateSecretOrThrowMock.mockReset();
    revalidateTagMock.mockReset();
    revalidatePathMock.mockReset();
    getCommunitiesFreshMock.mockReset();
    getTranslationsRevalidateSecretOrThrowMock.mockReturnValue('top-secret');
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

  it('should return 503 when translations revalidate secret is not configured', async () => {
    getTranslationsRevalidateSecretOrThrowMock.mockImplementation(() => {
      throw new Error('Missing TRANSLATIONS_REVALIDATE_SECRET');
    });

    const response = await POST(
      createRequest({ secret: 'top-secret', body: { namespace: 'about' } }),
    );

    expect(response.status).toBe(503);
  });

  it('should return 401 when secret header is missing or invalid', async () => {
    const response = await POST(createRequest({ body: { namespace: 'about' } }));

    expect(response.status).toBe(401);
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it('should return 400 when namespace is invalid', async () => {
    const response = await POST(
      createRequest({ secret: 'top-secret', body: { namespace: '$invalid' } }),
    );

    expect(response.status).toBe(400);
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it('should return 204 and revalidate namespace cache when request is valid', async () => {
    const response = await POST(
      createRequest({ secret: 'top-secret', body: { namespace: 'about' } }),
    );

    expect(response.status).toBe(204);
    expect(revalidateTagMock).toHaveBeenCalledWith('translations:ns:about', { expire: 0 });
    expect(revalidatePathMock).toHaveBeenCalledWith('/about');
  });

  it('should revalidate Community feed paths when a feed translation changes', async () => {
    const response = await POST(
      createRequest({ secret: 'top-secret', body: { namespace: 'city' } }),
    );

    expect(response.status).toBe(204);
    expect(revalidateTagMock).toHaveBeenCalledWith('translations:ns:city', { expire: 0 });
    expect(revalidatePathMock).toHaveBeenCalledWith('/feed/es/barcelona');
  });

  it('should revalidate llms.txt when llms namespace changes', async () => {
    const response = await POST(
      createRequest({ secret: 'top-secret', body: { namespace: 'llms' } }),
    );

    expect(response.status).toBe(204);
    expect(revalidateTagMock).toHaveBeenCalledWith('translations:ns:llms', { expire: 0 });
    expect(revalidatePathMock).toHaveBeenCalledWith('/llms.txt');
  });
});
