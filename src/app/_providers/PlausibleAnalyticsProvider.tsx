import PlausibleProvider from 'next-plausible';
import type { ReactNode } from 'react';
import { clientEnv } from '@/env/client-env';
import { serverEnv } from '@/env/server-env';

interface PlausibleAnalyticsProviderProps {
  readonly children: ReactNode;
}

export default function PlausibleAnalyticsProvider({ children }: PlausibleAnalyticsProviderProps) {
  const plausibleScriptSrc = clientEnv.plausibleScriptSrc;
  if (!serverEnv.isProductionSite || !plausibleScriptSrc) {
    return children;
  }

  return <PlausibleProvider src={plausibleScriptSrc}>{children}</PlausibleProvider>;
}
