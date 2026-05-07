import type { DefaultOptions } from '@tanstack/react-query';

/**
 * Production defaults for QueryClient (same instance shape in app and tests;
 * tests override retry/gcTime via {@link buildTestQueryClientDefaultOptions}).
 */
export const appQueryClientDefaultOptions: DefaultOptions = {
  queries: {
    retry: 1,
    refetchOnWindowFocus: false,
  },
};

export function buildTestQueryClientDefaultOptions(): DefaultOptions {
  return {
    queries: {
      ...appQueryClientDefaultOptions.queries,
      retry: false,
      gcTime: 0,
    },
    mutations: {
      ...(appQueryClientDefaultOptions.mutations ?? {}),
      retry: false,
    },
  };
}
