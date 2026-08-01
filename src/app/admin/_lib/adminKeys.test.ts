import { adminKeys } from '@/app/admin/_lib/adminKeys';
import { AdminGigsSortBy, AdminGigsSortOrder } from '@/app/admin/gigs/_lib/admin-gigs-sort';
import { GigStatusFilter } from '@/app/admin/gigs/_lib/types';

describe('adminKeys', () => {
  it('should build root admin key', () => {
    expect(adminKeys.all()).toEqual(['admin']);
  });

  it('should build dashboard key', () => {
    expect(adminKeys.dashboard()).toEqual(['admin', 'dashboard']);
  });

  it('should build locales key', () => {
    expect(adminKeys.locales()).toEqual(['admin', 'locales']);
  });

  it('should build translationNamespaces key', () => {
    expect(adminKeys.translationNamespaces()).toEqual(['admin', 'translationNamespaces']);
  });

  it('should build translations key with namespace and locale', () => {
    expect(adminKeys.translations('about', 'en')).toEqual(['admin', 'translations', 'about', 'en']);
  });

  it('should trim namespace in translations key', () => {
    expect(adminKeys.translations(' about ', 'en')).toEqual([
      'admin',
      'translations',
      'about',
      'en',
    ]);
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
