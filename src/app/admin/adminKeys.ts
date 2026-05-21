export const adminKeys = {
  all(): readonly ['admin'] {
    return ['admin'];
  },

  dashboard(): readonly ['admin', 'dashboard'] {
    return ['admin', 'dashboard'];
  },
} as const;
