import type { Route } from 'next';

import { ADMIN_GIGS_NEW_ROUTE, buildAdminGigEditRoute } from '@/app/admin/gigs/_lib/admin-gig-paths';
import { SUGGEST_ROUTE } from './suggest-paths';

const GIG_FORM_START_PARAM_PATTERN = /^[a-z0-9-]{1,64}$/i;

export function resolveAdminGigLaunchPath(startParam: string | undefined): Route {
  const trimmedStartParam = startParam?.trim();
  if (!trimmedStartParam || !GIG_FORM_START_PARAM_PATTERN.test(trimmedStartParam)) {
    return ADMIN_GIGS_NEW_ROUTE;
  }

  return buildAdminGigEditRoute(trimmedStartParam);
}

export function resolveSuggestLaunchPath(isAdmin: boolean, startParam: string | undefined): Route {
  if (isAdmin) {
    return resolveAdminGigLaunchPath(startParam);
  }

  return SUGGEST_ROUTE;
}
