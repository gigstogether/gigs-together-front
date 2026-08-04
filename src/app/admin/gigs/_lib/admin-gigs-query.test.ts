import { describe, expect, it } from 'vitest';

import {
  buildAdminGigsSearchParams,
  getAdminGigsQueryStateOrDefaults,
} from '@/app/admin/gigs/_lib/admin-gigs-query';
import { AdminGigsSortBy, AdminGigsSortOrder } from '@/app/admin/gigs/_lib/admin-gigs-sort';
import { GigStatusFilter } from '@/app/admin/gigs/_lib/types';
import { parseGigStatusFilterFromQuery } from '@/app/admin/gigs/_lib/admin-gig-status';

describe('parseGigStatusFilterFromQuery', () => {
  it('should return pending when query value is missing', () => {
    expect(parseGigStatusFilterFromQuery(null)).toBe(GigStatusFilter.Pending);
  });

  it('should return pending when query value is invalid', () => {
    expect(parseGigStatusFilterFromQuery('unknown')).toBe(GigStatusFilter.Pending);
  });

  it('should return approved when query value is approved', () => {
    expect(parseGigStatusFilterFromQuery('approved')).toBe(GigStatusFilter.Approved);
  });

  it('should return pending when query value is published', () => {
    expect(parseGigStatusFilterFromQuery('published')).toBe(GigStatusFilter.Pending);
  });
});

describe('readAdminGigsQueryState', () => {
  it('should default to createdAt sort for rejected when sortBy is missing', () => {
    const params = new URLSearchParams('status=rejected&gig=gig-42');
    expect(getAdminGigsQueryStateOrDefaults(params)).toEqual({
      filter: GigStatusFilter.Rejected,
      selectedGigPublicId: 'gig-42',
      sortBy: AdminGigsSortBy.CreatedAt,
      sortOrder: AdminGigsSortOrder.Desc,
    });
  });

  it('should default to createdAt sort for pending when sortBy is missing', () => {
    const params = new URLSearchParams('status=pending');
    expect(getAdminGigsQueryStateOrDefaults(params)).toEqual({
      filter: GigStatusFilter.Pending,
      selectedGigPublicId: null,
      sortBy: AdminGigsSortBy.CreatedAt,
      sortOrder: AdminGigsSortOrder.Desc,
    });
  });

  it('should default to createdAt sort for approved when sortBy is missing', () => {
    const params = new URLSearchParams('status=approved');
    expect(getAdminGigsQueryStateOrDefaults(params)).toEqual({
      filter: GigStatusFilter.Approved,
      selectedGigPublicId: null,
      sortBy: AdminGigsSortBy.CreatedAt,
      sortOrder: AdminGigsSortOrder.Desc,
    });
  });

  it('should read explicit sort params from search params', () => {
    const params = new URLSearchParams('status=approved&sortBy=eventDate&sortOrder=asc');
    expect(getAdminGigsQueryStateOrDefaults(params)).toEqual({
      filter: GigStatusFilter.Approved,
      selectedGigPublicId: null,
      sortBy: AdminGigsSortBy.EventDate,
      sortOrder: AdminGigsSortOrder.Asc,
    });
  });

  it('should fall back to createdAt when sortBy is postDate', () => {
    const params = new URLSearchParams('status=approved&sortBy=postDate&sortOrder=asc');
    expect(getAdminGigsQueryStateOrDefaults(params)).toEqual({
      filter: GigStatusFilter.Approved,
      selectedGigPublicId: null,
      sortBy: AdminGigsSortBy.CreatedAt,
      sortOrder: AdminGigsSortOrder.Asc,
    });
  });
});

describe('buildAdminGigsSearchParams', () => {
  it('should omit gig param when selection is cleared', () => {
    const params = buildAdminGigsSearchParams({
      filter: GigStatusFilter.Pending,
      selectedGigPublicId: null,
      sortBy: AdminGigsSortBy.CreatedAt,
      sortOrder: AdminGigsSortOrder.Desc,
    });
    expect(params.toString()).toBe('status=pending&sortBy=createdAt&sortOrder=desc');
  });

  it('should include gig param when gig is selected', () => {
    const params = buildAdminGigsSearchParams({
      filter: GigStatusFilter.Pending,
      selectedGigPublicId: 'radiohead-barcelona-2026-06-12',
      sortBy: AdminGigsSortBy.CreatedAt,
      sortOrder: AdminGigsSortOrder.Desc,
    });
    expect(params.toString()).toBe(
      'status=pending&sortBy=createdAt&sortOrder=desc&gig=radiohead-barcelona-2026-06-12',
    );
  });
});
