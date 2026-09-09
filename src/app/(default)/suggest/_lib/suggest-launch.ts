import type { Route } from 'next';

import { buildAdminGigEditRoute } from '@/lib/admin-gig-paths';
import { ADMIN_GIG_CANDIDATE_NEW_ROUTE } from '@/lib/admin-gig-candidate-paths';
import { SUGGEST_ROUTE } from '@/lib/suggest-paths';

const GIG_FORM_START_PARAM_PATTERN = /^[a-z0-9-]{1,64}$/i;

export function resolveAdminGigLaunchPath(startParam: string | undefined): Route {
  const trimmedStartParam = startParam?.trim();
  if (!trimmedStartParam || !GIG_FORM_START_PARAM_PATTERN.test(trimmedStartParam)) {
    return ADMIN_GIG_CANDIDATE_NEW_ROUTE;
  }

  return buildAdminGigEditRoute(trimmedStartParam);
}

export function resolveSuggestLaunchPath(isAdmin: boolean, startParam: string | undefined): Route {
  if (isAdmin) {
    return resolveAdminGigLaunchPath(startParam);
  }

  return SUGGEST_ROUTE;
}
