import { describe, expect, it } from 'vitest';

import { GigStatus, GigStatusAPI } from '@/app/admin/gigs/types';
import { getGigStatusFromAdminGigStatusAPI } from '@/app/admin/gigs/admin-gigs-filter';

describe('getGigStatusFromAdminGigStatusAPI', () => {
  it('should map API statuses to list filter statuses', () => {
    expect(getGigStatusFromAdminGigStatusAPI(GigStatusAPI.Approved)).toBe(GigStatus.Approved);
    expect(getGigStatusFromAdminGigStatusAPI(GigStatusAPI.Published)).toBe(GigStatus.Approved);
    expect(getGigStatusFromAdminGigStatusAPI(GigStatusAPI.Rejected)).toBe(GigStatus.Rejected);
    expect(getGigStatusFromAdminGigStatusAPI(GigStatusAPI.Pending)).toBe(GigStatus.Pending);
    expect(getGigStatusFromAdminGigStatusAPI(GigStatusAPI.New)).toBe(GigStatus.Pending);
  });
});
