import { describe, expect, it } from 'vitest';

import {
  buildAdminGigsSearchParams,
  getAdminGigsQueryStateOrDefaults,
} from '@/app/admin/gigs/admin-gigs-query';
import { AdminGigsSortBy, AdminGigsSortOrder } from '@/app/admin/gigs/admin-gigs-sort';
import { GigStatus } from '@/app/admin/gigs/types';
import { parseGigStatusFromQuery } from '@/app/admin/gigs/admin-gigs-filter';

describe('parseGigStatusFromQuery', () => {
  it('should return pending when query value is missing', () => {
    expect(parseGigStatusFromQuery(null)).toBe(GigStatus.Pending);
  });

  it('should return pending when query value is invalid', () => {
    expect(parseGigStatusFromQuery('unknown')).toBe(GigStatus.Pending);
  });

  it('should return approved when query value is approved', () => {
    expect(parseGigStatusFromQuery('approved')).toBe(GigStatus.Approved);
  });

  it('should return pending when query value is published', () => {
    expect(parseGigStatusFromQuery('published')).toBe(GigStatus.Pending);
  });
});

describe('readAdminGigsQueryState', () => {
  it('should default to createdAt sort for rejected when sortBy is missing', () => {
    const params = new URLSearchParams('status=rejected&gig=gig-42');
    expect(getAdminGigsQueryStateOrDefaults(params)).toEqual({
      filter: GigStatus.Rejected,
      selectedGigPublicId: 'gig-42',
      sortBy: AdminGigsSortBy.CreatedAt,
      sortOrder: AdminGigsSortOrder.Desc,
    });
  });

  it('should default to createdAt sort for pending when sortBy is missing', () => {
    const params = new URLSearchParams('status=pending');
    expect(getAdminGigsQueryStateOrDefaults(params)).toEqual({
      filter: GigStatus.Pending,
      selectedGigPublicId: null,
      sortBy: AdminGigsSortBy.CreatedAt,
      sortOrder: AdminGigsSortOrder.Desc,
    });
  });

  it('should default to createdAt sort for approved when sortBy is missing', () => {
    const params = new URLSearchParams('status=approved');
    expect(getAdminGigsQueryStateOrDefaults(params)).toEqual({
      filter: GigStatus.Approved,
      selectedGigPublicId: null,
      sortBy: AdminGigsSortBy.CreatedAt,
      sortOrder: AdminGigsSortOrder.Desc,
    });
  });

  it('should read explicit sort params from search params', () => {
    const params = new URLSearchParams('status=approved&sortBy=eventDate&sortOrder=asc');
    expect(getAdminGigsQueryStateOrDefaults(params)).toEqual({
      filter: GigStatus.Approved,
      selectedGigPublicId: null,
      sortBy: AdminGigsSortBy.EventDate,
      sortOrder: AdminGigsSortOrder.Asc,
    });
  });

  it('should fall back to createdAt when sortBy is postDate', () => {
    const params = new URLSearchParams('status=approved&sortBy=postDate&sortOrder=asc');
    expect(getAdminGigsQueryStateOrDefaults(params)).toEqual({
      filter: GigStatus.Approved,
      selectedGigPublicId: null,
      sortBy: AdminGigsSortBy.CreatedAt,
      sortOrder: AdminGigsSortOrder.Asc,
    });
  });
});

describe('buildAdminGigsSearchParams', () => {
  it('should omit gig param when selection is cleared', () => {
    const params = buildAdminGigsSearchParams({
      filter: GigStatus.Pending,
      selectedGigPublicId: null,
      sortBy: AdminGigsSortBy.CreatedAt,
      sortOrder: AdminGigsSortOrder.Desc,
    });
    expect(params.toString()).toBe('status=pending&sortBy=createdAt&sortOrder=desc');
  });

  it('should include gig param when gig is selected', () => {
    const params = buildAdminGigsSearchParams({
      filter: GigStatus.Pending,
      selectedGigPublicId: 'radiohead-barcelona-2026-06-12',
      sortBy: AdminGigsSortBy.CreatedAt,
      sortOrder: AdminGigsSortOrder.Desc,
    });
    expect(params.toString()).toBe(
      'status=pending&sortBy=createdAt&sortOrder=desc&gig=radiohead-barcelona-2026-06-12',
    );
  });
});
