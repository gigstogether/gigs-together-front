export const authKeys = {
  all(): readonly ['auth'] {
    return ['auth'];
  },

  me(): readonly ['auth', 'me'] {
    return ['auth', 'me'];
  },
} as const;
