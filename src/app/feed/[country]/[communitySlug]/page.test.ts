import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { notFound } from 'next/navigation';

const feedClientMock = vi.hoisted(() => vi.fn(() => null));
const getFeedMock = vi.hoisted(() => vi.fn());

vi.mock('../../_components/FeedClient', () => ({ default: feedClientMock }));
vi.mock('@/app/feed/_lib/feed.server', () => ({ getFeed: getFeedMock }));
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));
vi.mock('@/env/client-env', () => ({ clientEnv: { feedPageSize: 10 } }));
const getTranslationsMock = vi.hoisted(() => vi.fn());
const getCommunitiesMock = vi.hoisted(() => vi.fn());
const getCommunityByRouteMock = vi.hoisted(() => vi.fn());

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
vi.mock('@/lib/community/community.server', () => ({
  getCommunities: getCommunitiesMock,
  getCommunityByRoute: getCommunityByRouteMock,
}));
vi.mock('@/providers/I18nProvider', () => ({
  I18nProvider: ({ children }: { children: ReactNode }) => children,
}));

import Page, { generateMetadata } from './page';

describe('feed community page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getFeedMock.mockResolvedValue({
      gigs: [],
      prevCursor: undefined,
      nextCursor: undefined,
    });
    getTranslationsMock.mockResolvedValue({
      locale: 'en',
      translations: {
        community: {
          'barcelona.name': {
            value: 'Barcelona',
            format: 'plain',
            kind: 'text',
          },
        },
      },
    });
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
    getCommunityByRouteMock.mockResolvedValue({
      community: {
        id: 'community-id',
        countryIso: 'ES',
        slug: 'barcelona',
        nameTranslationKey: 'barcelona.name',
        timeZone: 'Europe/Madrid',
      },
      nameTranslationNamespace: 'community',
    });
  });

  it.each([
    { country: 'ES', communitySlug: 'Barcelona' },
    { country: 'FR', communitySlug: 'unknown' },
  ])(
    'should return not found when the feed Community is unavailable at $country/$communitySlug',
    async (params) => {
      getCommunityByRouteMock.mockResolvedValue(undefined);
      await expect(Page({ params: Promise.resolve(params) })).rejects.toThrow(
        new Error('NEXT_NOT_FOUND'),
      );
      expect(notFound).toHaveBeenCalledOnce();
      expect(getFeedMock).not.toHaveBeenCalled();
    },
  );

  it.each([
    { country: 'ES', communitySlug: 'Barcelona' },
    { country: 'FR', communitySlug: 'unknown' },
  ])(
    'should return not found when generating metadata for an unavailable Community at $country/$communitySlug',
    async (params) => {
      getCommunityByRouteMock.mockResolvedValue(undefined);
      await expect(generateMetadata({ params: Promise.resolve(params) })).rejects.toThrow(
        new Error('NEXT_NOT_FOUND'),
      );
      expect(notFound).toHaveBeenCalledOnce();
    },
  );

  it('should generate feed routes from the Community catalog', async () => {
    const { generateStaticParams } = await import('./page');

    await expect(generateStaticParams()).resolves.toEqual([
      { country: 'es', communitySlug: 'barcelona' },
    ]);
  });

  it('should return location-specific metadata for the feed location', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ country: 'ES', communitySlug: 'Barcelona' }),
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
      params: Promise.resolve({ country: 'ES', communitySlug: 'Barcelona' }),
    });

    const html = renderToStaticMarkup(page);

    expect(html).toContain('<h1 class="sr-only">Barcelona | Gigs Together!</h1>');
    expect(getTranslationsMock).toHaveBeenCalledWith('en', ['community']);
  });
});
