import { describe, expect, it } from 'vitest';

import {
  buildAdminGigEditHref,
  buildAdminGigsPath,
  buildAdminGigsSearchParams,
  parseGigStatusFromQuery,
  readAdminGigsQueryState,
} from '@/app/admin/gigs/admin-gigs-query';
import { AdminGigsSortBy, AdminGigsSortOrder } from '@/app/admin/gigs/admin-gigs-sort';
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
  it('should default to createdAt sort for rejected when sortBy is missing', () => {
    const params = new URLSearchParams('status=rejected&gig=gig-42');
    expect(readAdminGigsQueryState(params)).toEqual({
      filter: GigStatus.Rejected,
      selectedGigPublicId: 'gig-42',
      sortBy: AdminGigsSortBy.CreatedAt,
      sortOrder: AdminGigsSortOrder.Desc,
      isEditing: false,
    });
  });

  it('should default to createdAt sort for pending when sortBy is missing', () => {
    const params = new URLSearchParams('status=pending');
    expect(readAdminGigsQueryState(params)).toEqual({
      filter: GigStatus.Pending,
      selectedGigPublicId: null,
      sortBy: AdminGigsSortBy.CreatedAt,
      sortOrder: AdminGigsSortOrder.Desc,
      isEditing: false,
    });
  });

  it('should default to createdAt sort for published when sortBy is missing', () => {
    const params = new URLSearchParams('status=published');
    expect(readAdminGigsQueryState(params)).toEqual({
      filter: GigStatus.Published,
      selectedGigPublicId: null,
      sortBy: AdminGigsSortBy.CreatedAt,
      sortOrder: AdminGigsSortOrder.Desc,
      isEditing: false,
    });
  });

  it('should read explicit sort params from search params', () => {
    const params = new URLSearchParams('status=published&sortBy=eventDate&sortOrder=asc');
    expect(readAdminGigsQueryState(params)).toEqual({
      filter: GigStatus.Published,
      selectedGigPublicId: null,
      sortBy: AdminGigsSortBy.EventDate,
      sortOrder: AdminGigsSortOrder.Asc,
      isEditing: false,
    });
  });

  it('should fall back to createdAt when sortBy is postDate', () => {
    const params = new URLSearchParams('status=published&sortBy=postDate&sortOrder=asc');
    expect(readAdminGigsQueryState(params)).toEqual({
      filter: GigStatus.Published,
      selectedGigPublicId: null,
      sortBy: AdminGigsSortBy.CreatedAt,
      sortOrder: AdminGigsSortOrder.Asc,
      isEditing: false,
    });
  });

  it('should read edit mode from search params', () => {
    const params = new URLSearchParams('status=pending&gig=gig-42&edit=1');
    expect(readAdminGigsQueryState(params)).toEqual({
      filter: GigStatus.Pending,
      selectedGigPublicId: 'gig-42',
      sortBy: AdminGigsSortBy.CreatedAt,
      sortOrder: AdminGigsSortOrder.Desc,
      isEditing: true,
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
      isEditing: false,
    });
    expect(params.toString()).toBe('status=pending&sortBy=createdAt&sortOrder=desc');
  });

  it('should include gig param when gig is selected', () => {
    const params = buildAdminGigsSearchParams({
      filter: GigStatus.Pending,
      selectedGigPublicId: 'radiohead-barcelona-2026-06-12',
      sortBy: AdminGigsSortBy.CreatedAt,
      sortOrder: AdminGigsSortOrder.Desc,
      isEditing: false,
    });
    expect(params.toString()).toBe(
      'status=pending&sortBy=createdAt&sortOrder=desc&gig=radiohead-barcelona-2026-06-12',
    );
  });

  it('should include edit param when editing', () => {
    const params = buildAdminGigsSearchParams({
      filter: GigStatus.Pending,
      selectedGigPublicId: 'gig-42',
      sortBy: AdminGigsSortBy.CreatedAt,
      sortOrder: AdminGigsSortOrder.Desc,
      isEditing: true,
    });
    expect(params.toString()).toBe(
      'status=pending&sortBy=createdAt&sortOrder=desc&gig=gig-42&edit=1',
    );
  });
});

describe('buildAdminGigEditHref', () => {
  it('should build inline edit href with gig and edit params', () => {
    expect(buildAdminGigEditHref('placebo-2026-09-16')).toBe(
      '/admin/gigs?status=pending&sortBy=createdAt&sortOrder=desc&gig=placebo-2026-09-16&edit=1',
    );
  });

  it('should throw when publicId is empty', () => {
    expect(() => buildAdminGigEditHref('   ')).toThrow('publicId is required');
  });
});

describe('buildAdminGigsPath', () => {
  it('should build preview href without edit param', () => {
    expect(
      buildAdminGigsPath({
        filter: GigStatus.Published,
        selectedGigPublicId: 'gig-42',
        sortBy: AdminGigsSortBy.EventDate,
        sortOrder: AdminGigsSortOrder.Asc,
        isEditing: false,
      }),
    ).toBe('/admin/gigs?status=published&sortBy=eventDate&sortOrder=asc&gig=gig-42');
  });
});
