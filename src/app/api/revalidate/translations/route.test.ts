import { NextRequest } from 'next/server';
import { POST } from '@/app/api/revalidate/translations/route';

const getTranslationsRevalidateSecretOrThrowMock = vi.hoisted(() => vi.fn());
const revalidateTagMock = vi.hoisted(() => vi.fn());
const revalidatePathMock = vi.hoisted(() => vi.fn());

vi.mock('@/env/server-env', () => ({
  getTranslationsRevalidateSecretOrThrow: getTranslationsRevalidateSecretOrThrowMock,
}));

vi.mock('next/cache', () => ({
  revalidateTag: revalidateTagMock,
  revalidatePath: revalidatePathMock,
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
    getTranslationsRevalidateSecretOrThrowMock.mockReturnValue('top-secret');
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

  it('should revalidate tag only when namespace has no mapped paths', async () => {
    const response = await POST(
      createRequest({ secret: 'top-secret', body: { namespace: 'country' } }),
    );

    expect(response.status).toBe(204);
    expect(revalidateTagMock).toHaveBeenCalledWith('translations:ns:country', { expire: 0 });
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});
