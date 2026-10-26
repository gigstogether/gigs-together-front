'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const GOATCOUNTER_SCRIPT_SRC = 'https://gc.zgo.at/count.js';
const GOATCOUNTER_SCRIPT_SETTINGS = JSON.stringify({ no_onload: true });
const ADMIN_PATH = '/admin';

interface GoatCounterCountParams {
  path: string;
}

interface GoatCounterClient {
  count(params: GoatCounterCountParams): void;
}

declare global {
  interface Window {
    goatcounter?: GoatCounterClient;
  }
}

interface GoatCounterAnalyticsProps {
  endpoint?: string;
}

function isExcludedPath(pathname: string): boolean {
  return pathname === ADMIN_PATH || pathname.startsWith(`${ADMIN_PATH}/`);
}

export default function GoatCounterAnalytics({ endpoint }: GoatCounterAnalyticsProps) {
  const pathname = usePathname();
  const [isScriptReady, setIsScriptReady] = useState(false);
  const previousPathnameRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!endpoint || !isScriptReady || previousPathnameRef.current === pathname) {
      return;
    }

    if (isExcludedPath(pathname)) {
      previousPathnameRef.current = pathname;
      return;
    }

    const goatCounterClient = window.goatcounter;
    if (!goatCounterClient) {
      console.warn('GoatCounter script loaded without exposing its client API.');
      return;
    }

    goatCounterClient.count({ path: pathname });
    previousPathnameRef.current = pathname;
  }, [endpoint, isScriptReady, pathname]);

  if (!endpoint) {
    return null;
  }

  return (
    <Script
      id="goatcounter-analytics"
      src={GOATCOUNTER_SCRIPT_SRC}
      data-goatcounter={endpoint}
      data-goatcounter-settings={GOATCOUNTER_SCRIPT_SETTINGS}
      strategy="afterInteractive"
      onLoad={() => setIsScriptReady(true)}
    />
  );
}
