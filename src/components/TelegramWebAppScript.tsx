'use client';

import { useSyncExternalStore } from 'react';
import Script from 'next/script';
import { isTelegramMiniApp } from '@/lib/telegram-webapp';

function subscribeToTelegramMiniAppEnv(): () => void {
  // Mini App detection is resolved from URL/localStorage before React mounts.
  return () => {};
}

function getTelegramMiniAppScriptSnapshot(): boolean {
  return isTelegramMiniApp();
}

function getTelegramMiniAppScriptServerSnapshot(): boolean {
  return false;
}

export default function TelegramWebAppScript() {
  const shouldLoadScript = useSyncExternalStore(
    subscribeToTelegramMiniAppEnv,
    getTelegramMiniAppScriptSnapshot,
    getTelegramMiniAppScriptServerSnapshot,
  );

  if (!shouldLoadScript) {
    return null;
  }

  return (
    <Script
      src="https://telegram.org/js/telegram-web-app.js?56"
      strategy="afterInteractive"
    />
  );
}
