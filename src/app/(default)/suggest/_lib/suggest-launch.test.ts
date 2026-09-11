import { describe, expect, it } from 'vitest';

import { ADMIN_GIG_CANDIDATE_NEW_ROUTE } from '@/lib/admin-gig-candidate-paths';
import { resolveAdminGigLaunchPath, resolveSuggestLaunchPath } from './suggest-launch';
import { SUGGEST_ROUTE } from '@/lib/suggest-paths';

describe('resolveAdminGigLaunchPath', () => {
  it('should route to create page when start param is missing', () => {
    expect(resolveAdminGigLaunchPath(undefined)).toBe(ADMIN_GIG_CANDIDATE_NEW_ROUTE);
  });

  it('should route to Gig edit page when its typed start param is valid', () => {
    expect(resolveAdminGigLaunchPath('editGig-dev-stub-qwe-new-2026-06-29')).toBe(
      '/admin/gigs/dev-stub-qwe-new-2026-06-29/edit',
    );
  });

  it('should route to GigCandidate edit page when its start param is valid', () => {
    expect(resolveAdminGigLaunchPath('editGigCandidate-507f1f77bcf86cd799439099')).toBe(
      '/admin/gig-candidates/507f1f77bcf86cd799439099/edit',
    );
  });

  it('should route to create page when a GigCandidate start param is malformed', () => {
    expect(resolveAdminGigLaunchPath('editGigCandidate-invalid')).toBe(
      ADMIN_GIG_CANDIDATE_NEW_ROUTE,
    );
  });

  it('should route to create page when a Gig start param is malformed', () => {
    expect(resolveAdminGigLaunchPath('editGig-bad/value')).toBe(ADMIN_GIG_CANDIDATE_NEW_ROUTE);
  });

  it('should route to create page when a typed action is unknown', () => {
    expect(resolveAdminGigLaunchPath('deleteGig-dev-stub-qwe-new-2026-06-29')).toBe(
      ADMIN_GIG_CANDIDATE_NEW_ROUTE,
    );
  });

  it('should reject an untyped Gig public id', () => {
    expect(resolveAdminGigLaunchPath('dev-stub-qwe-new-2026-06-29')).toBe(
      ADMIN_GIG_CANDIDATE_NEW_ROUTE,
    );
  });

  it('should reject an underscored GigCandidate action', () => {
    expect(resolveAdminGigLaunchPath('gigCandidate_507f1f77bcf86cd799439099')).toBe(
      ADMIN_GIG_CANDIDATE_NEW_ROUTE,
    );
  });

  it('should route to create page when start param is invalid', () => {
    expect(resolveAdminGigLaunchPath('bad/value')).toBe(ADMIN_GIG_CANDIDATE_NEW_ROUTE);
  });
});

describe('resolveSuggestLaunchPath', () => {
  it('should route admin users to the new GigCandidate form', () => {
    expect(resolveSuggestLaunchPath(true)).toBe(ADMIN_GIG_CANDIDATE_NEW_ROUTE);
  });

  it('should route non-admin users to the public suggest page', () => {
    expect(resolveSuggestLaunchPath(false)).toBe(SUGGEST_ROUTE);
  });
});
