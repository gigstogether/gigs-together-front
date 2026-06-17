import { describe, expect, it } from 'vitest';

import {
  ADMIN_GIGS_DEFAULT_SORT_ORDER,
  AdminGigsSortBy,
  AdminGigsSortOrder,
  getAdminGigsSortOrderLabel,
  getAdminGigsSortOrderShortLabel,
  parseAdminGigsSortByFromQuery,
  parseAdminGigsSortOrderFromQuery,
} from '@/app/admin/gigs/admin-gigs-sort';

describe('parseAdminGigsSortByFromQuery', () => {
  it('should return createdAt when query value is missing', () => {
    expect(parseAdminGigsSortByFromQuery(null)).toBe(AdminGigsSortBy.CreatedAt);
  });

  it('should return createdAt when query value is createdAt', () => {
    expect(parseAdminGigsSortByFromQuery('createdAt')).toBe(AdminGigsSortBy.CreatedAt);
  });

  it('should return eventDate when query value is eventDate', () => {
    expect(parseAdminGigsSortByFromQuery('eventDate')).toBe(AdminGigsSortBy.EventDate);
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
