import { describe, expect, it } from 'vitest';

import {
  ADMIN_GIGS_DEFAULT_SORT_ORDER,
  AdminGigsSortBy,
  AdminGigsSortOrder,
  getAdminGigsSortOrderLabel,
  getAdminGigsSortOrderShortLabel,
  getDefaultAdminGigsSortBy,
  parseAdminGigsSortByFromQuery,
  parseAdminGigsSortOrderFromQuery,
} from '@/app/admin/gigs/admin-gigs-sort';
import { GigStatus } from '@/app/admin/gigs/types';

describe('getDefaultAdminGigsSortBy', () => {
  it('should return createdAt for pending and rejected', () => {
    expect(getDefaultAdminGigsSortBy(GigStatus.Pending)).toBe(AdminGigsSortBy.CreatedAt);
    expect(getDefaultAdminGigsSortBy(GigStatus.Rejected)).toBe(AdminGigsSortBy.CreatedAt);
  });

  it('should return postDate for published', () => {
    expect(getDefaultAdminGigsSortBy(GigStatus.Published)).toBe(AdminGigsSortBy.PostDate);
  });
});

describe('parseAdminGigsSortByFromQuery', () => {
  it('should return createdAt for pending when query value is missing', () => {
    expect(parseAdminGigsSortByFromQuery(null, GigStatus.Pending)).toBe(AdminGigsSortBy.CreatedAt);
  });

  it('should return postDate for published when query value is missing', () => {
    expect(parseAdminGigsSortByFromQuery(null, GigStatus.Published)).toBe(AdminGigsSortBy.PostDate);
  });

  it('should return default sort when query value is invalid', () => {
    expect(parseAdminGigsSortByFromQuery('unknown', GigStatus.Rejected)).toBe(
      AdminGigsSortBy.CreatedAt,
    );
  });

  it('should return postDate when query value is postDate', () => {
    expect(parseAdminGigsSortByFromQuery('postDate', GigStatus.Pending)).toBe(
      AdminGigsSortBy.PostDate,
    );
  });

  it('should return createdAt when query value is createdAt', () => {
    expect(parseAdminGigsSortByFromQuery('createdAt', GigStatus.Pending)).toBe(
      AdminGigsSortBy.CreatedAt,
    );
  });

  it('should return eventDate when query value is eventDate', () => {
    expect(parseAdminGigsSortByFromQuery('eventDate', GigStatus.Published)).toBe(
      AdminGigsSortBy.EventDate,
    );
  });
});

describe('parseAdminGigsSortOrderFromQuery', () => {
  it('should return default order when query value is missing', () => {
    expect(parseAdminGigsSortOrderFromQuery(null)).toBe(ADMIN_GIGS_DEFAULT_SORT_ORDER);
  });

  it('should return desc when query value is desc', () => {
    expect(parseAdminGigsSortOrderFromQuery('desc')).toBe(AdminGigsSortOrder.Desc);
  });

  it('should return asc when query value is asc', () => {
    expect(parseAdminGigsSortOrderFromQuery('asc')).toBe(AdminGigsSortOrder.Asc);
  });
});

describe('getAdminGigsSortOrderShortLabel', () => {
  it('should return Oldest when order is asc', () => {
    expect(getAdminGigsSortOrderShortLabel(AdminGigsSortOrder.Asc)).toBe('Oldest');
  });

  it('should return Newest when order is desc', () => {
    expect(getAdminGigsSortOrderShortLabel(AdminGigsSortOrder.Desc)).toBe('Newest');
  });
});

describe('getAdminGigsSortOrderLabel', () => {
  it('should return oldest first label when order is asc', () => {
    expect(getAdminGigsSortOrderLabel(AdminGigsSortOrder.Asc)).toBe('Oldest first');
  });

  it('should return newest first label when order is desc', () => {
    expect(getAdminGigsSortOrderLabel(AdminGigsSortOrder.Desc)).toBe('Newest first');
  });
});
