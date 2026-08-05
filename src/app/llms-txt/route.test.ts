import type { V1TranslationValue } from '@/lib/api-boundary-schemas';
import { GET } from '@/app/llms-txt/route';

const getAppBaseUrlOrThrowMock = vi.hoisted(() => vi.fn());
const getTranslationsMock = vi.hoisted(() => vi.fn());

const llmsTranslations: Record<string, V1TranslationValue> = {
  content: {
    value: `# Gigs Together!

> Gigs Together helps people find friends and company for concerts.

Intro paragraph.

## Product
- [Barcelona feed]({baseUrl}/feed/es/barcelona): Barcelona feed description.

## Community
- [Telegram community]({telegramUrl}): Telegram community description.`,
    format: 'plain',
    kind: 'template',
  },
};

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

vi.mock('@/lib/i18n/translations.server', () => ({
  getTranslations: getTranslationsMock,
}));

describe('GET', () => {
  beforeEach(() => {
    getAppBaseUrlOrThrowMock.mockReset();
    getTranslationsMock.mockReset();
    getAppBaseUrlOrThrowMock.mockReturnValue('https://gigstogether.example');
    getTranslationsMock.mockResolvedValue({
      locale: 'en',
      translations: {
        llms: llmsTranslations,
      },
    });
  });

  it('should return 404 on non-production deployments', async () => {
    vi.resetModules();
    vi.doMock('@/env/server-env', () => ({
      getAppBaseUrlOrThrow: getAppBaseUrlOrThrowMock,
      serverEnv: {
        isProductionSite: false,
      },
    }));

    const routeModule = await import('@/app/llms-txt/route');
    const response = await routeModule.GET();

    expect(response.status).toBe(404);
  });

  it('should return llms.txt markdown with text/plain content type on production', async () => {
    const response = await GET();

    expect(getTranslationsMock).toHaveBeenCalledWith('en', 'llms');
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');

    const body = await response.text();
    expect(body.startsWith('# Gigs Together!\n\n>')).toBe(true);
    expect(body).toContain('[Barcelona feed](https://gigstogether.example/feed/es/barcelona)');
    expect(body).toContain('[Telegram community](https://t.me/gigstogether)');
  });

  it('should return 503 when llms translation namespace is missing', async () => {
    getTranslationsMock.mockResolvedValue({
      locale: 'en',
      translations: {},
    });

    const response = await GET();

    expect(response.status).toBe(503);
    await expect(response.text()).resolves.toContain('Missing "llms" translation namespace');
  });
});
