import { feedKeys } from './feedKeys';

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

  it('should build a stable calendar dates key for a location', () => {
    expect(
      feedKeys.calendarAvailableDates({
        country: 'es',
        city: 'barcelona',
      }),
    ).toEqual([
      'feed',
      'calendar-available-dates',
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

  it('should build a stable around-window key', () => {
    expect(
      feedKeys.aroundWindow({
        country: 'es',
        city: 'barcelona',
        anchorYmd: '2026-05-07',
        beforeLimit: 10,
        afterLimit: 12,
      }),
    ).toEqual([
      'feed',
      'around-window',
      {
        country: 'es',
        city: 'barcelona',
        anchorYmd: '2026-05-07',
        beforeLimit: 10,
        afterLimit: 12,
      },
    ]);
  });
});
