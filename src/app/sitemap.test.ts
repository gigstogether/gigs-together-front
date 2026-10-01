import sitemap from '@/app/sitemap';

const getAppBaseUrlOrThrowMock = vi.hoisted(() => vi.fn());

vi.mock('@/env/server-env', () => ({
  getAppBaseUrlOrThrow: getAppBaseUrlOrThrowMock,
  serverEnv: {
    isProductionSite: true,
  },
}));

describe('sitemap', () => {
  beforeEach(() => {
    getAppBaseUrlOrThrowMock.mockReset();
    getAppBaseUrlOrThrowMock.mockReturnValue('https://gigstogether.example');
  });

  it('should return an empty sitemap on non-production deployments', async () => {
    vi.resetModules();
    vi.doMock('@/env/server-env', () => ({
      getAppBaseUrlOrThrow: getAppBaseUrlOrThrowMock,
      serverEnv: {
        isProductionSite: false,
      },
    }));

    const sitemapModule = await import('@/app/sitemap');
    const result = sitemapModule.default();

    expect(result).toEqual([]);
  });

  it('should return only canonical public urls on production', () => {
    const result = sitemap();

    expect(result.map(({ url }) => url)).toEqual([
      'https://gigstogether.example/about',
      'https://gigstogether.example/feed/es/barcelona',
    ]);
  });
});
