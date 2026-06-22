import { describe, expect, it } from 'vitest';

import {
  buildAdminGigFeedHref,
  formatAdminGigEventDate,
  formatAdminGigListMeta,
} from '@/app/admin/gigs/admin-gig-format';
import { GigStatusAPI } from '@/app/admin/gigs/types';
import type { AdminGigQueueItem } from '@/app/admin/gigs/types';

describe('formatAdminGigEventDate', () => {
  it('should return single date when end date is missing', () => {
    const formatted = formatAdminGigEventDate('2026-06-12');
    expect(formatted).toContain('2026');
    expect(formatted).toContain('Jun');
  });

  it('should include range when end date differs', () => {
    const formatted = formatAdminGigEventDate('2026-07-03', '2026-07-04');
    expect(formatted).toContain('–');
  });
});

describe('buildAdminGigFeedHref', () => {
  it('should build feed path with publicId hash', () => {
    expect(
      buildAdminGigFeedHref({
        publicId: 'radiohead-barcelona-2026-06-12',
        country: 'ES',
        city: 'barcelona',
      }),
    ).toBe('/feed/es/barcelona#radiohead-barcelona-2026-06-12');
  });
});

describe('formatAdminGigListMeta', () => {
  it('should return formatted event date', () => {
    const gig: AdminGigQueueItem = {
      publicId: 'a',
      title: 'T',
      status: GigStatusAPI.Pending,
      date: '2026-06-12',
      city: 'barcelona',
      country: 'ES',
      venue: 'V',
      suggestedBy: { userId: '123', name: 'A' },
    };
    expect(formatAdminGigListMeta(gig)).toContain('2026');
    expect(formatAdminGigListMeta(gig)).not.toContain('barcelona');
  });
});
