import type { AdminGigsSortBy, AdminGigsSortOrder } from '@/app/admin/gigs/_lib/admin-gigs-sort';
import type {
  AdminGigCandidatesSortBy,
  AdminGigCandidatesSortOrder,
  GigCandidateStatusFilter,
} from '@/app/admin/gig-candidates/_lib/admin-gig-candidate';

/** Sentinel for "no filter" in admin translation dropdowns; not a valid domain value. */
export const ADMIN_FILTER_ALL = '__all__' as const;

export const ADMIN_ALL_TRANSLATION_NAMESPACES = ADMIN_FILTER_ALL;
export const ADMIN_ALL_TRANSLATION_LOCALES = ADMIN_FILTER_ALL;
export const ADMIN_ALL_TRANSLATION_KINDS = ADMIN_FILTER_ALL;
export const ADMIN_ALL_TRANSLATION_STATUSES = ADMIN_FILTER_ALL;

export const adminKeys = {
  all(): readonly ['admin'] {
    return ['admin'];
  },

  dashboard(): readonly ['admin', 'dashboard'] {
    return ['admin', 'dashboard'];
  },

  locales(): readonly ['admin', 'locales'] {
    return ['admin', 'locales'];
  },

  translationNamespaces(): readonly ['admin', 'translationNamespaces'] {
    return ['admin', 'translationNamespaces'];
  },

  translations(
    namespace: string,
    locale?: string,
  ): readonly ['admin', 'translations', string, string | undefined] {
    return ['admin', 'translations', namespace.trim(), locale?.trim().toLowerCase()];
  },

  gigs(
    sortBy: AdminGigsSortBy,
    sortOrder: AdminGigsSortOrder,
  ): readonly ['admin', 'gigs', AdminGigsSortBy, AdminGigsSortOrder] {
    return ['admin', 'gigs', sortBy, sortOrder];
  },

  gigByPublicId(publicId: string): readonly ['admin', 'gig', string] {
    return ['admin', 'gig', publicId.trim()];
  },

  gigsRoot(): readonly ['admin', 'gigs'] {
    return ['admin', 'gigs'];
  },

  gigCandidates(
    filter: GigCandidateStatusFilter,
    sortBy: AdminGigCandidatesSortBy,
    sortOrder: AdminGigCandidatesSortOrder,
  ): readonly [
    'admin',
    'gigCandidates',
    GigCandidateStatusFilter,
    AdminGigCandidatesSortBy,
    AdminGigCandidatesSortOrder,
  ] {
    return ['admin', 'gigCandidates', filter, sortBy, sortOrder];
  },

  gigCandidatesRoot(): readonly ['admin', 'gigCandidates'] {
    return ['admin', 'gigCandidates'];
  },

  gigCandidateById(gigCandidateId: string): readonly ['admin', 'gigCandidate', string] {
    return ['admin', 'gigCandidate', gigCandidateId.trim()];
  },
} as const;
