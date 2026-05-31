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
      selectedGigId: 'gig-42',
    });
  });
});

describe('buildAdminGigsSearchParams', () => {
  it('should omit gig param when selection is cleared', () => {
    const params = buildAdminGigsSearchParams({ filter: GigStatus.Pending, selectedGigId: null });
    expect(params.toString()).toBe('status=pending');
  });

  it('should include gig param when gig is selected', () => {
    const params = buildAdminGigsSearchParams({
      filter: GigStatus.Pending,
      selectedGigId: 'gig-1',
    });
    expect(params.toString()).toBe('status=pending&gig=gig-1');
  });
});
