import { feedKeys } from '@/lib/feed/feedKeys';

describe('feedKeys', () => {
  it('should build a root key for feed invalidation', () => {
    expect(feedKeys.all()).toEqual(['feed']);
  });

  it('should build a stable events key for a location', () => {
    expect(
      feedKeys.events({
        country: 'es',
        city: 'barcelona',
      }),
    ).toEqual([
      'feed',
      'events',
      {
        country: 'es',
        city: 'barcelona',
      },
    ]);
  });

  it('should build a stable anchor date key for a public id', () => {
    expect(feedKeys.anchorDateByPublicId('gig-public-id')).toEqual([
      'feed',
      'anchor-date',
      'gig-public-id',
    ]);
  });

  it('should build a stable around key for location and anchor', () => {
    expect(
      feedKeys.around({
        country: 'es',
        city: 'barcelona',
        anchorYmd: '2026-05-01',
        beforeLimit: 10,
        afterLimit: 10,
      }),
    ).toEqual([
      'feed',
      'around',
      {
        country: 'es',
        city: 'barcelona',
        anchorYmd: '2026-05-01',
        beforeLimit: 10,
        afterLimit: 10,
      },
    ]);
  });
});
