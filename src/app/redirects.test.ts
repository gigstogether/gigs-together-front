import nextConfig from '../../next.config.mjs';
import { DEFAULT_FEED_PATH } from '@/lib/feed/feed.routes';

describe('nextConfig.redirects', () => {
  it('should permanently redirect feed aliases to the canonical feed URL', async () => {
    const createRedirects = nextConfig.redirects;
    if (!createRedirects) {
      throw new Error('Expected Next.js redirects to be configured');
    }

    const redirects = await createRedirects();

    expect(redirects).toEqual([
      {
        source: '/',
        destination: DEFAULT_FEED_PATH,
        permanent: true,
      },
      {
        source: '/feed',
        destination: DEFAULT_FEED_PATH,
        permanent: true,
      },
      {
        source: '/feed/es',
        destination: DEFAULT_FEED_PATH,
        permanent: true,
      },
      {
        source: '/feed/barcelona',
        destination: DEFAULT_FEED_PATH,
        permanent: true,
      },
    ]);
  });
});
