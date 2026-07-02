import type { GigStatusFilter } from '@/app/admin/gigs/types';
import type { AdminGigsSortBy, AdminGigsSortOrder } from '@/app/admin/gigs/admin-gigs-sort';

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

  gigs(
    filter: GigStatusFilter,
    sortBy: AdminGigsSortBy,
    sortOrder: AdminGigsSortOrder,
  ): readonly ['admin', 'gigs', GigStatusFilter, AdminGigsSortBy, AdminGigsSortOrder] {
    return ['admin', 'gigs', filter, sortBy, sortOrder];
  },

  gigByPublicId(publicId: string): readonly ['admin', 'gig', string] {
    return ['admin', 'gig', publicId.trim()];
  },

  gigsRoot(): readonly ['admin', 'gigs'] {
    return ['admin', 'gigs'];
  },
} as const;
