const getTranslationsMock = vi.hoisted(() => vi.fn());

vi.mock('@/env/server-env', () => ({
  serverEnv: {
    appBaseUrl: 'https://gigstogether.example',
    brandName: 'Gigs Together',
  },
}));

vi.mock('@/lib/i18n/translations.server', () => ({
  getTranslations: getTranslationsMock,
}));

import { generateMetadata } from './page';

describe('generateMetadata', () => {
  it('should return translated metadata with a self-referencing canonical', async () => {
    getTranslationsMock.mockResolvedValueOnce({
      translations: {
        about: {
          title: { value: 'About', format: 'plain', kind: 'text' },
          metaDescription: {
            value: 'About Gigs Together!',
            format: 'plain',
            kind: 'text',
          },
        },
      },
    });

    const metadata = await generateMetadata();

    expect(metadata).toEqual({
      title: 'About',
      description: 'About Gigs Together!',
      alternates: {
        canonical: '/about',
      },
      openGraph: {
        type: 'website',
        siteName: 'Gigs Together',
        title: 'About',
        description: 'About Gigs Together!',
        url: 'https://gigstogether.example/about',
        images: [
          {
            url: 'https://gigstogether.example/logo-1200x630.png',
            width: 1200,
            height: 630,
            alt: 'About',
          },
        ],
      },
    });
  });
});
