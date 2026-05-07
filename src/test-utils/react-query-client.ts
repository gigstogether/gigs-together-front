import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';

import type { PropsWithChildren, ReactElement } from 'react';

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function createQueryClientWrapper(
  queryClient: QueryClient,
): (props: PropsWithChildren) => ReactElement {
  return function QueryClientWrapper({ children }: PropsWithChildren): ReactElement {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}
