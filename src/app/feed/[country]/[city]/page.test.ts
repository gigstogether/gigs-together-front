vi.mock('../../_components/FeedClient', () => ({ default: vi.fn() }));
vi.mock('@/app/feed/_lib/feed.server', () => ({ getFeed: vi.fn() }));
vi.mock('@/env/client-env', () => ({ clientEnv: { feedPageSize: 10 } }));
vi.mock('@/env/server-env', () => ({
  serverEnv: {
    appBaseUrl: 'https://gigstogether.example',
    brandName: 'Gigs Together!',
    sitePreviewTitle: 'Gigs Together!',
    sitePreviewDescription: 'Find gigs and company in your city.',
    eagerInitialPosterCount: 5,
  },
}));
vi.mock('@/lib/i18n/translations.server', () => ({ getTranslations: vi.fn() }));
vi.mock('@/providers/I18nProvider', () => ({ I18nProvider: vi.fn() }));

import { generateMetadata } from './page';

describe('generateMetadata', () => {
  it('should return a self-referencing canonical for the feed location', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ country: 'ES', city: 'Barcelona' }),
    });

    expect(metadata).toEqual({
      alternates: {
        canonical: '/feed/es/barcelona',
      },
      openGraph: {
        type: 'website',
        siteName: 'Gigs Together!',
        title: 'Gigs Together!',
        description: 'Find gigs and company in your city.',
        url: 'https://gigstogether.example/feed/es/barcelona',
        images: [
          {
            url: 'https://gigstogether.example/logo-1200x630.png',
            width: 1200,
            height: 630,
            alt: 'Gigs Together!',
          },
        ],
      },
    });
  });
});
