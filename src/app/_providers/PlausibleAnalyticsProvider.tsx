'use client';

import PlausibleProvider from 'next-plausible';
import type { ReactNode } from 'react';
import { clientEnv } from '@/env/client-env';

interface PlausibleAnalyticsProviderProps {
  children: ReactNode;
}

export default function PlausibleAnalyticsProvider({ children }: PlausibleAnalyticsProviderProps) {
  const plausibleScriptSrc = clientEnv.plausibleScriptSrc;
  if (!plausibleScriptSrc) {
    return children;
  }

  return <PlausibleProvider src={plausibleScriptSrc}>{children}</PlausibleProvider>;
}
