import { describe, expect, it } from 'vitest';

import { GigStatus, GigStatusAPI } from '@/app/admin/gigs/types';
import { mapGigStatusFromAPI } from '@/app/admin/gigs/admin-gig-status';

describe('mapGigStatusFromAPI', () => {
  it('should map API statuses to list filter statuses', () => {
    expect(mapGigStatusFromAPI(GigStatusAPI.Approved)).toBe(GigStatus.Approved);
    expect(mapGigStatusFromAPI(GigStatusAPI.Published)).toBe(GigStatus.Published);
    expect(mapGigStatusFromAPI(GigStatusAPI.Rejected)).toBe(GigStatus.Rejected);
    expect(mapGigStatusFromAPI(GigStatusAPI.Pending)).toBe(GigStatus.Pending);
    expect(mapGigStatusFromAPI(GigStatusAPI.New)).toBe(GigStatus.New);
  });
});
