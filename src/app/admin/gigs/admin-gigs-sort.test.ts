import { describe, expect, it } from 'vitest';

import {
  ADMIN_GIGS_DEFAULT_SORT_BY,
  ADMIN_GIGS_DEFAULT_SORT_ORDER,
  getAdminGigsSortOrderLabel,
  getAdminGigsSortOrderShortLabel,
  parseAdminGigsSortByFromQuery,
  parseAdminGigsSortOrderFromQuery,
} from '@/app/admin/gigs/admin-gigs-sort';

describe('parseAdminGigsSortByFromQuery', () => {
  it('should return default sort when query value is missing', () => {
    expect(parseAdminGigsSortByFromQuery(null)).toBe(ADMIN_GIGS_DEFAULT_SORT_BY);
  });

  it('should return default sort when query value is invalid', () => {
    expect(parseAdminGigsSortByFromQuery('unknown')).toBe(ADMIN_GIGS_DEFAULT_SORT_BY);
  });

  it('should return post_date when query value is post_date', () => {
    expect(parseAdminGigsSortByFromQuery('post_date')).toBe('post_date');
  });
});

describe('parseAdminGigsSortOrderFromQuery', () => {
  it('should return default order when query value is missing', () => {
    expect(parseAdminGigsSortOrderFromQuery(null)).toBe(ADMIN_GIGS_DEFAULT_SORT_ORDER);
  });

  it('should return desc when query value is desc', () => {
    expect(parseAdminGigsSortOrderFromQuery('desc')).toBe('desc');
  });

  it('should return asc when query value is asc', () => {
    expect(parseAdminGigsSortOrderFromQuery('asc')).toBe('asc');
  });
});

describe('getAdminGigsSortOrderShortLabel', () => {
  it('should return Oldest when order is asc', () => {
    expect(getAdminGigsSortOrderShortLabel('asc')).toBe('Oldest');
  });

  it('should return Newest when order is desc', () => {
    expect(getAdminGigsSortOrderShortLabel('desc')).toBe('Newest');
  });
});

describe('getAdminGigsSortOrderLabel', () => {
  it('should return oldest first label when order is asc', () => {
    expect(getAdminGigsSortOrderLabel('asc')).toBe('Oldest first');
  });

  it('should return newest first label when order is desc', () => {
    expect(getAdminGigsSortOrderLabel('desc')).toBe('Newest first');
  });
});
