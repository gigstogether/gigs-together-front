import { describe, expect, it } from 'vitest';

import { getGigStatusFromAdminGigStatusAPI, GigStatus } from '@/app/admin/gigs/types';

describe('getGigStatusFromAdminGigStatusAPI', () => {
  it('should map API statuses to list filter statuses', () => {
    expect(getGigStatusFromAdminGigStatusAPI('Approved')).toBe(GigStatus.Approved);
    expect(getGigStatusFromAdminGigStatusAPI('Published')).toBe(GigStatus.Approved);
    expect(getGigStatusFromAdminGigStatusAPI('Rejected')).toBe(GigStatus.Rejected);
    expect(getGigStatusFromAdminGigStatusAPI('Pending')).toBe(GigStatus.Pending);
    expect(getGigStatusFromAdminGigStatusAPI('New')).toBe(GigStatus.Pending);
  });
});
