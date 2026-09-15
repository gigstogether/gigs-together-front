import { describe, expect, it } from 'vitest';

import { ADMIN_GIG_CANDIDATE_NEW_ROUTE } from '@/lib/admin-gig-candidate-paths';
import { resolveAdminTelegramLaunch, resolveSuggestLaunchPath } from './suggest-launch';
import { SUGGEST_ROUTE } from '@/lib/suggest-paths';

describe('resolveAdminTelegramLaunch', () => {
  it('should return a missing-action failure when start param is missing', () => {
    expect(resolveAdminTelegramLaunch(undefined)).toEqual({
      kind: 'failed',
      reason: 'missingAction',
    });
  });

  it('should route to Gig edit page when its typed start param is valid', () => {
    expect(resolveAdminTelegramLaunch('editGig-dev-stub-qwe-new-2026-06-29')).toEqual({
      kind: 'resolved',
      route: '/admin/gigs/dev-stub-qwe-new-2026-06-29/edit',
    });
  });

  it('should route to GigCandidate edit page when its start param is valid', () => {
    expect(resolveAdminTelegramLaunch('editGigCandidate-507f1f77bcf86cd799439099')).toEqual({
      kind: 'resolved',
      route: '/admin/gig-candidates/507f1f77bcf86cd799439099/edit',
    });
  });

  it('should return an invalid-action failure when a GigCandidate action is malformed', () => {
    expect(resolveAdminTelegramLaunch('editGigCandidate-invalid')).toEqual({
      kind: 'failed',
      reason: 'invalidAction',
    });
  });

  it('should return an invalid-action failure when a Gig action is malformed', () => {
    expect(resolveAdminTelegramLaunch('editGig-bad/value')).toEqual({
      kind: 'failed',
      reason: 'invalidAction',
    });
  });

  it('should return an invalid-action failure when a typed action is unknown', () => {
    expect(resolveAdminTelegramLaunch('deleteGig-dev-stub-qwe-new-2026-06-29')).toEqual({
      kind: 'failed',
      reason: 'invalidAction',
    });
  });

  it('should reject an untyped Gig public id', () => {
    expect(resolveAdminTelegramLaunch('dev-stub-qwe-new-2026-06-29')).toEqual({
      kind: 'failed',
      reason: 'invalidAction',
    });
  });

  it('should reject an underscored GigCandidate action', () => {
    expect(resolveAdminTelegramLaunch('gigCandidate_507f1f77bcf86cd799439099')).toEqual({
      kind: 'failed',
      reason: 'invalidAction',
    });
  });

  it('should return an invalid-action failure when start param is invalid', () => {
    expect(resolveAdminTelegramLaunch('bad/value')).toEqual({
      kind: 'failed',
      reason: 'invalidAction',
    });
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
