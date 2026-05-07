import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';

import type { PropsWithChildren, ReactElement } from 'react';

import { buildTestQueryClientDefaultOptions } from '@/lib/react-query-client-defaults';

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: buildTestQueryClientDefaultOptions(),
  });
}

export function createQueryClientWrapper(
  queryClient: QueryClient,
): (props: PropsWithChildren) => ReactElement {
  return function QueryClientWrapper({ children }: PropsWithChildren): ReactElement {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}
