import { describe, expect, it } from 'vitest';

import {
  buildAdminGigPublicHref,
  formatAdminGigEventDate,
  formatAdminGigListMeta,
  formatAdminGigSource,
} from '@/app/admin/gigs/_lib/admin-gig-format';
import type { AdminGigQueueItem } from '@/app/admin/gigs/_lib/types';

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

describe('buildAdminGigPublicHref', () => {
  it('should build public gig path with encoded publicId', () => {
    expect(
      buildAdminGigPublicHref({
        publicId: 'radiohead barcelona 2026-06-12',
      }),
    ).toBe('/gigs/radiohead%20barcelona%202026-06-12');
  });
});

describe('formatAdminGigListMeta', () => {
  it('should return formatted event date', () => {
    const gig: AdminGigQueueItem = {
      publicId: 'a',
      title: 'T',
      isVisible: false,
      version: 3,
      source: {
        type: 'user',
        userId: '123',
        isCurrentlyAdmin: false,
        origin: { type: 'admin' },
      },
      date: '2026-06-12',
      city: 'barcelona',
      country: 'ES',
      venue: 'V',
    };
    expect(formatAdminGigListMeta(gig)).toContain('2026');
    expect(formatAdminGigListMeta(gig)).not.toContain('barcelona');
  });
});

describe('formatAdminGigSource', () => {
  it('should show displayName for an admin submitter', () => {
    expect(
      formatAdminGigSource(
        {
          type: 'user',
          userId: '123',
          displayName: 'Test Admin',
          isCurrentlyAdmin: true,
          telegramUsername: 'test_admin',
          origin: { type: 'messenger' },
        },
      ),
    ).toBe('Source: user · Test Admin · currently admin · TG: @test_admin');
  });

  it('should show the user name and Telegram username without an admin marker', () => {
    expect(
      formatAdminGigSource(
        {
          type: 'user',
          userId: '123',
          displayName: 'Test User',
          isCurrentlyAdmin: false,
          telegramUsername: 'test_user',
          origin: { type: 'form' },
        },
      ),
    ).toBe('Source: user · Test User · TG: @test_user');
  });
});
