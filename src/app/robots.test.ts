import robots from '@/app/robots';

const getAppBaseUrlOrThrowMock = vi.hoisted(() => vi.fn());

vi.mock('@/env/server-env', () => ({
  getAppBaseUrlOrThrow: getAppBaseUrlOrThrowMock,
  serverEnv: {
    isProductionSite: true,
  },
}));

describe('robots', () => {
  beforeEach(() => {
    getAppBaseUrlOrThrowMock.mockReset();
    getAppBaseUrlOrThrowMock.mockReturnValue('https://gigstogether.example');
  });

  it('should disallow all crawling on non-production deployments', async () => {
    vi.resetModules();
    vi.doMock('@/env/server-env', () => ({
      getAppBaseUrlOrThrow: getAppBaseUrlOrThrowMock,
      serverEnv: {
        isProductionSite: false,
      },
    }));

    const robotsModule = await import('@/app/robots');
    const result = robotsModule.default();

    expect(result).toEqual({
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    });
  });

  it('should allow public pages and expose sitemap on production', () => {
    const result = robots();

    expect(result).toEqual({
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api'],
      },
      sitemap: 'https://gigstogether.example/sitemap.xml',
    });
  });
});
