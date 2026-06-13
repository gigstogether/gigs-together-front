import type { GigStatus } from '@/app/admin/gigs/types';
import type { AdminGigsSortBy, AdminGigsSortOrder } from '@/app/admin/gigs/admin-gigs-sort';

export const adminKeys = {
  all(): readonly ['admin'] {
    return ['admin'];
  },

  dashboard(): readonly ['admin', 'dashboard'] {
    return ['admin', 'dashboard'];
  },

  languages(): readonly ['admin', 'languages'] {
    return ['admin', 'languages'];
  },

  gigs(
    filter: GigStatus,
    sortBy: AdminGigsSortBy,
    sortOrder: AdminGigsSortOrder,
  ): readonly ['admin', 'gigs', GigStatus, AdminGigsSortBy, AdminGigsSortOrder] {
    return ['admin', 'gigs', filter, sortBy, sortOrder];
  },

  gigByPublicId(publicId: string): readonly ['admin', 'gig', string] {
    return ['admin', 'gig', publicId.trim()];
  },
} as const;
