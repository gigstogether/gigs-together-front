import type { GigStatus } from '@/app/admin/gigs/types';

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

  gigs(filter: GigStatus): readonly ['admin', 'gigs', GigStatus] {
    return ['admin', 'gigs', filter];
  },
} as const;
