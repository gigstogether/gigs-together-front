import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const feedClientMock = vi.hoisted(() => vi.fn(() => null));
const getFeedMock = vi.hoisted(() => vi.fn());

vi.mock('../../_components/FeedClient', () => ({ default: feedClientMock }));
vi.mock('@/app/feed/_lib/feed.server', () => ({ getFeed: getFeedMock }));
vi.mock('@/env/client-env', () => ({ clientEnv: { feedPageSize: 10 } }));
const getTranslationsMock = vi.hoisted(() => vi.fn());

vi.mock('@/env/server-env', () => ({
  serverEnv: {
    appBaseUrl: 'https://gigstogether.example',
    brandName: 'Gigs Together!',
    sitePreviewTitle: 'Gigs Together!',
    sitePreviewDescription: 'Find gigs and company in your city.',
    eagerInitialPosterCount: 5,
  },
}));
vi.mock('@/lib/i18n/translations.server', () => ({ getTranslations: getTranslationsMock }));
vi.mock('@/providers/I18nProvider', () => ({
  I18nProvider: ({ children }: { children: ReactNode }) => children,
}));

import Page, { generateMetadata } from './page';

describe('feed city page', () => {
  beforeEach(() => {
    feedClientMock.mockClear();
    getFeedMock.mockResolvedValue({
      gigs: [],
      prevCursor: undefined,
      nextCursor: undefined,
    });
    getTranslationsMock.mockResolvedValue({
      locale: 'en',
      translations: {
        city: {
          barcelona: {
            value: 'Barcelona',
            format: 'plain',
            kind: 'text',
          },
        },
      },
    });
  });

  it('should return location-specific metadata for the feed location', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ country: 'ES', city: 'Barcelona' }),
    });

    expect(metadata).toEqual({
      title: {
        absolute: 'Barcelona | Gigs Together!',
      },
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

  it('should expose the metadata title as the accessible page heading', async () => {
    const page = await Page({
      params: Promise.resolve({ country: 'ES', city: 'Barcelona' }),
    });

    const html = renderToStaticMarkup(page);

    expect(html).toContain('<h1 class="sr-only">Barcelona | Gigs Together!</h1>');
  });
});
