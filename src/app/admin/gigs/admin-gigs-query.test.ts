import { describe, expect, it } from 'vitest';

import {
  buildAdminGigsSearchParams,
  parseGigStatusFromQuery,
  readAdminGigsQueryState,
} from '@/app/admin/gigs/admin-gigs-query';
import { GigStatus } from '@/app/admin/gigs/types';

describe('parseGigStatusFromQuery', () => {
  it('should return pending when query value is missing', () => {
    expect(parseGigStatusFromQuery(null)).toBe(GigStatus.Pending);
  });

  it('should return pending when query value is invalid', () => {
    expect(parseGigStatusFromQuery('unknown')).toBe(GigStatus.Pending);
  });

  it('should return published when query value is published', () => {
    expect(parseGigStatusFromQuery('published')).toBe(GigStatus.Published);
  });
});

describe('readAdminGigsQueryState', () => {
  it('should read filter and selected gig from search params', () => {
    const params = new URLSearchParams('status=rejected&gig=gig-42');
    expect(readAdminGigsQueryState(params)).toEqual({
      filter: GigStatus.Rejected,
      selectedGigPublicId: 'gig-42',
      sortBy: 'post_date',
      sortOrder: 'desc',
    });
  });

  it('should read sort params from search params', () => {
    const params = new URLSearchParams('status=published&sortBy=post_date&sortOrder=asc');
    expect(readAdminGigsQueryState(params)).toEqual({
      filter: GigStatus.Published,
      selectedGigPublicId: null,
      sortBy: 'post_date',
      sortOrder: 'asc',
    });
  });
});

describe('buildAdminGigsSearchParams', () => {
  it('should omit gig param when selection is cleared', () => {
    const params = buildAdminGigsSearchParams({
      filter: GigStatus.Pending,
      selectedGigPublicId: null,
      sortBy: 'post_date',
      sortOrder: 'desc',
    });
    expect(params.toString()).toBe('status=pending&sortBy=post_date&sortOrder=desc');
  });

  it('should include gig param when gig is selected', () => {
    const params = buildAdminGigsSearchParams({
      filter: GigStatus.Pending,
      selectedGigPublicId: 'radiohead-barcelona-2026-06-12',
      sortBy: 'post_date',
      sortOrder: 'desc',
    });
    expect(params.toString()).toBe(
      'status=pending&sortBy=post_date&sortOrder=desc&gig=radiohead-barcelona-2026-06-12',
    );
  });
});
