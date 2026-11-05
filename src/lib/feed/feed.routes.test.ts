import { buildFeedHeaderHomeRoute } from '@/lib/feed/feed.routes';

describe('buildFeedHeaderHomeRoute', () => {
  it('should return root when location is omitted', () => {
    expect(buildFeedHeaderHomeRoute()).toBe('/');
    expect(buildFeedHeaderHomeRoute(undefined)).toBe('/');
  });

  it('should return feed country path when only country is provided', () => {
    expect(buildFeedHeaderHomeRoute({ country: 'ES' })).toBe('/feed/es');
  });

  it('should return feed location path when country and community are provided', () => {
    expect(buildFeedHeaderHomeRoute({ country: 'es', communitySlug: 'Barcelona' })).toBe(
      '/feed/es/barcelona',
    );
  });
});
