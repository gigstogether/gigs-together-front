vi.mock('@/env/server-env', () => ({
  serverEnv: {
    appBaseUrl: 'https://gigstogether.example',
    brandName: 'Gigs Together!',
  },
}));

import { createOpenGraphMetadata } from '@/lib/open-graph';

describe('createOpenGraphMetadata', () => {
  it('should return complete Open Graph metadata for a page URL', () => {
    const metadata = createOpenGraphMetadata({
      url: '/about',
      title: 'About',
      description: 'About Gigs Together!',
    });

    expect(metadata).toEqual({
      type: 'website',
      siteName: 'Gigs Together!',
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
    });
  });

  it('should omit the page URL when creating fallback metadata', () => {
    const metadata = createOpenGraphMetadata({
      title: 'Gigs Together!',
      description: 'Find gigs and company in your city.',
    });

    expect(metadata).not.toHaveProperty('url');
  });
});
