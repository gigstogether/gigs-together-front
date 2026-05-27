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
} as const;
