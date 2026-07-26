import { NextRequest } from 'next/server';
import { POST } from '@/app/api/revalidate/feed/route';

const getFeedRevalidateSecretOrThrowMock = vi.hoisted(() => vi.fn());
const revalidatePathMock = vi.hoisted(() => vi.fn());

vi.mock('@/env/server-env', () => ({
  getFeedRevalidateSecretOrThrow: getFeedRevalidateSecretOrThrowMock,
}));

vi.mock('next/cache', () => ({
  revalidatePath: revalidatePathMock,
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
    getFeedRevalidateSecretOrThrowMock.mockReturnValue('top-secret');
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
