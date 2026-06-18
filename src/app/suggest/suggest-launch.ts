import { buildAdminGigEditPath, ADMIN_GIGS_BASE_PATH } from '@/app/admin/gigs/admin-gig-paths';

const GIG_FORM_START_PARAM_PATTERN = /^[a-z0-9-]{1,64}$/i;

export function resolveAdminGigLaunchPath(startParam: string | undefined): string {
  const trimmedStartParam = startParam?.trim();
  if (!trimmedStartParam || !GIG_FORM_START_PARAM_PATTERN.test(trimmedStartParam)) {
    return `${ADMIN_GIGS_BASE_PATH}/new`;
  }

  return buildAdminGigEditPath(ADMIN_GIGS_BASE_PATH, trimmedStartParam);
}

export function resolveSuggestLaunchPath(isAdmin: boolean, startParam: string | undefined): string {
  if (isAdmin) {
    return resolveAdminGigLaunchPath(startParam);
  }

  return '/suggest';
}
