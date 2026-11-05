import sitemap from '@/app/sitemap';

const getAppBaseUrlOrThrowMock = vi.hoisted(() => vi.fn());
const getCommunitiesMock = vi.hoisted(() => vi.fn());

vi.mock('@/env/server-env', () => ({
  getAppBaseUrlOrThrow: getAppBaseUrlOrThrowMock,
  serverEnv: {
    isProductionSite: true,
  },
}));

vi.mock('@/lib/community/community.server', () => ({
  getCommunities: getCommunitiesMock,
}));

describe('sitemap', () => {
  beforeEach(() => {
    getAppBaseUrlOrThrowMock.mockReset();
    getAppBaseUrlOrThrowMock.mockReturnValue('https://gigstogether.example');
    getCommunitiesMock.mockReset();
    getCommunitiesMock.mockResolvedValue({
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

  it('should return an empty sitemap on non-production deployments', async () => {
    vi.resetModules();
    vi.doMock('@/env/server-env', () => ({
      getAppBaseUrlOrThrow: getAppBaseUrlOrThrowMock,
      serverEnv: {
        isProductionSite: false,
      },
    }));

    const sitemapModule = await import('@/app/sitemap');
    const result = await sitemapModule.default();

    expect(result).toEqual([]);
  });

  it('should return only canonical public urls on production', async () => {
    const result = await sitemap();

    expect(result.map(({ url }) => url)).toEqual([
      'https://gigstogether.example/about',
      'https://gigstogether.example/feed/es/barcelona',
    ]);
  });
});
