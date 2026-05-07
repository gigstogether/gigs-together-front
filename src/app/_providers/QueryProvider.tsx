'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { clientEnv } from '@/env/client-env';
import { appQueryClientDefaultOptions } from '@/lib/react-query-client-defaults';

interface QueryProviderProps {
  readonly children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: appQueryClientDefaultOptions,
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {clientEnv.isDevelopment ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  );
}
