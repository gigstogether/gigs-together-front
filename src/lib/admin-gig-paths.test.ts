import { describe, expect, it } from 'vitest';

import {
  ADMIN_GIGS_BASE_PATH,
  buildAdminGigEditRoute,
  buildAdminGigEditPath,
  buildAdminGigPublicIdPath,
  buildAdminGigPublicIdRoute,
  buildAdminGigsRoute,
} from '@/lib/admin-gig-paths';

describe('buildAdminGigEditPath', () => {
  it('should build encoded edit path when publicId contains special characters', () => {
    expect(buildAdminGigEditPath('my-gig-id')).toBe('/admin/gigs/my-gig-id/edit');
  });

  it('should throw when publicId is empty', () => {
    expect(() => buildAdminGigEditPath('   ')).toThrow('publicId is required');
  });
});

describe('buildAdminGigEditRoute', () => {
  it('should build typed edit route for publicId', () => {
    expect(buildAdminGigEditRoute('my-gig-id')).toBe('/admin/gigs/my-gig-id/edit');
  });
});

describe('buildAdminGigPublicIdPath', () => {
  it('should build share path for publicId', () => {
    expect(buildAdminGigPublicIdPath('my-gig-id')).toBe('/admin/gigs/my-gig-id');
  });
});

describe('buildAdminGigPublicIdRoute', () => {
  it('should build typed publicId route for publicId', () => {
    expect(buildAdminGigPublicIdRoute('my-gig-id')).toBe('/admin/gigs/my-gig-id');
  });
});

describe('buildAdminGigsRoute', () => {
  it('should return base gigs route when query string is empty', () => {
    expect(buildAdminGigsRoute('')).toBe(ADMIN_GIGS_BASE_PATH);
  });

  it('should append serialized search params to the gigs route', () => {
    expect(buildAdminGigsRoute(new URLSearchParams('status=pending'))).toBe(
      '/admin/gigs?status=pending',
    );
  });
});
