import { describe, expect, it } from 'vitest';

import { buildGigFormEditPath, GIG_FORM_ADMIN_BASE_PATH } from '@/app/gig-form/gig-form-paths';

describe('buildGigFormEditPath', () => {
  it('should build encoded edit path when publicId contains special characters', () => {
    expect(buildGigFormEditPath(GIG_FORM_ADMIN_BASE_PATH, 'my-gig-id')).toBe(
      '/admin/gigs/my-gig-id/edit',
    );
  });

  it('should throw when publicId is empty', () => {
    expect(() => buildGigFormEditPath(GIG_FORM_ADMIN_BASE_PATH, '   ')).toThrow(
      'publicId is required',
    );
  });
});
