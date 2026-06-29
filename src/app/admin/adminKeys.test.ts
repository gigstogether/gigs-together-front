import { adminKeys } from '@/app/admin/adminKeys';
import { AdminGigsSortBy, AdminGigsSortOrder } from '@/app/admin/gigs/admin-gigs-sort';
import { GigStatusFilter } from '@/app/admin/gigs/types';

describe('adminKeys', () => {
  it('should build root admin key', () => {
    expect(adminKeys.all()).toEqual(['admin']);
  });

  it('should build dashboard key', () => {
    expect(adminKeys.dashboard()).toEqual(['admin', 'dashboard']);
  });

  it('should build languages key', () => {
    expect(adminKeys.languages()).toEqual(['admin', 'languages']);
  });

  it('should build gigs key with filter status and sort options', () => {
    expect(
      adminKeys.gigs(GigStatusFilter.Pending, AdminGigsSortBy.CreatedAt, AdminGigsSortOrder.Desc),
    ).toEqual([
      'admin',
      'gigs',
      GigStatusFilter.Pending,
      AdminGigsSortBy.CreatedAt,
      AdminGigsSortOrder.Desc,
    ]);
  });

  it('should build gigs root key for partial invalidation', () => {
    expect(adminKeys.gigsRoot()).toEqual(['admin', 'gigs']);
  });
});
