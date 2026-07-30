import { GET } from '@/app/llms.txt/route';

const getAppBaseUrlOrThrowMock = vi.hoisted(() => vi.fn());

vi.mock('@/env/server-env', () => ({
  getAppBaseUrlOrThrow: getAppBaseUrlOrThrowMock,
  serverEnv: {
    isProductionSite: true,
  },
}));

vi.mock('@/env/client-env', () => ({
  clientEnv: {
    telegramUrl: 'https://t.me/gigstogether',
    githubUrl: 'https://github.com/example/gigs-together-front',
  },
}));

describe('GET', () => {
  beforeEach(() => {
    getAppBaseUrlOrThrowMock.mockReset();
    getAppBaseUrlOrThrowMock.mockReturnValue('https://gigstogether.example');
  });

  it('should return 404 on non-production deployments', async () => {
    vi.resetModules();
    vi.doMock('@/env/server-env', () => ({
      getAppBaseUrlOrThrow: getAppBaseUrlOrThrowMock,
      serverEnv: {
        isProductionSite: false,
      },
    }));

    const routeModule = await import('@/app/llms.txt/route');
    const response = routeModule.GET();

    expect(response.status).toBe(404);
  });

  it('should return llms.txt markdown with text/plain content type on production', async () => {
    const response = GET();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');

    const body = await response.text();
    expect(body.startsWith('# Gigs Together!\n\n>')).toBe(true);
    expect(body).toContain('[Barcelona feed](https://gigstogether.example/feed/es/barcelona)');
    expect(body).toContain('[Telegram community](https://t.me/gigstogether)');
  });
});
