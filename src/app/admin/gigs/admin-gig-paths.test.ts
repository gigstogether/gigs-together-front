import { describe, expect, it } from 'vitest';

import {
  ADMIN_GIGS_BASE_PATH,
  buildAdminGigEditPath,
  buildAdminGigPublicIdPath,
} from '@/app/admin/gigs/admin-gig-paths';

describe('buildAdminGigEditPath', () => {
  it('should build encoded edit path when publicId contains special characters', () => {
    expect(buildAdminGigEditPath(ADMIN_GIGS_BASE_PATH, 'my-gig-id')).toBe(
      '/admin/gigs/my-gig-id/edit',
    );
  });

  it('should throw when publicId is empty', () => {
    expect(() => buildAdminGigEditPath(ADMIN_GIGS_BASE_PATH, '   ')).toThrow(
      'publicId is required',
    );
  });
});

describe('buildAdminGigPublicIdPath', () => {
  it('should build share path for publicId', () => {
    expect(buildAdminGigPublicIdPath(ADMIN_GIGS_BASE_PATH, 'my-gig-id')).toBe(
      '/admin/gigs/my-gig-id',
    );
  });
});
