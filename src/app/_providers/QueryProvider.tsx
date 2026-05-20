'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { clientEnv } from '@/env/client-env';
import { prefetchAuthMeProfile } from '@/lib/auth-me';
import { appQueryClientDefaultOptions } from '@/lib/react-query-client-defaults';

interface QueryProviderProps {
  readonly children: ReactNode;
}

// TODO (React Query + Next.js RSC): Optional SSR prefetch path — on the server, create a QueryClient
// per request (never a singleton), prefetch with fetchQuery/prefetchQuery, dehydrate the cache, pass
// dehydrated state into HydrationBoundary on the client so useQuery/useInfiniteQuery hydrate without
// duplicating initialData from props. Factors: align query keys with client hooks; infinite feed today
// relies on SSR props + initialData/setQueryData — migrating needs a deliberate shape for dehydrated
// infinite data; streaming and which routes benefit vs added wiring.

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: appQueryClientDefaultOptions,
      }),
  );

  useEffect(() => {
    void prefetchAuthMeProfile(queryClient);
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {clientEnv.isDevelopment ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  );
}
