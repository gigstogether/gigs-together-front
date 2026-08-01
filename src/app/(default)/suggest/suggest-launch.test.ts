import { describe, expect, it } from 'vitest';

import { ADMIN_GIGS_NEW_ROUTE } from '@/app/admin/gigs/_lib/admin-gig-paths';
import { resolveAdminGigLaunchPath, resolveSuggestLaunchPath } from './suggest-launch';
import { SUGGEST_ROUTE } from './suggest-paths';

describe('resolveAdminGigLaunchPath', () => {
  it('should route to create page when start param is missing', () => {
    expect(resolveAdminGigLaunchPath(undefined)).toBe(ADMIN_GIGS_NEW_ROUTE);
  });

  it('should route to edit page when start param is valid', () => {
    expect(resolveAdminGigLaunchPath('dev-stub-qwe-new-2026-06-29')).toBe(
      '/admin/gigs/dev-stub-qwe-new-2026-06-29/edit',
    );
  });

  it('should route to create page when start param is invalid', () => {
    expect(resolveAdminGigLaunchPath('bad/value')).toBe(ADMIN_GIGS_NEW_ROUTE);
  });
});

describe('resolveSuggestLaunchPath', () => {
  it('should route admin users to the create gig form when start param is missing', () => {
    expect(resolveSuggestLaunchPath(true, undefined)).toBe(ADMIN_GIGS_NEW_ROUTE);
  });

  it('should route admin users to the edit gig form when start param is valid', () => {
    expect(resolveSuggestLaunchPath(true, 'dev-stub-qwe-new-2026-06-29')).toBe(
      '/admin/gigs/dev-stub-qwe-new-2026-06-29/edit',
    );
  });

  it('should route non-admin users to the public suggest page', () => {
    expect(resolveSuggestLaunchPath(false, 'dev-stub-qwe-new-2026-06-29')).toBe(SUGGEST_ROUTE);
  });
});
