'use client';

import Script from 'next/script';
import { useTelegramMiniAppEnv } from '@/hooks/use-telegram-mini-app-env';
import { clearTelegramLaunchParamsFromUrl } from '@/lib/telegram/telegram-webapp';

const TELEGRAM_WEB_APP_SCRIPT_SRC = 'https://telegram.org/js/telegram-web-app.js?64';

export default function TelegramWebAppBootstrap() {
  const miniAppEnv = useTelegramMiniAppEnv();

  if (miniAppEnv !== 'mini') {
    return null;
  }

  const handleReady = (): void => {
    if (!window.Telegram?.WebApp) {
      console.error('[Telegram.WebApp] SDK loaded without exposing Telegram.WebApp.');
      return;
    }

    clearTelegramLaunchParamsFromUrl();
  };

  const handleError = (e: Error): void => {
    console.error('[Telegram.WebApp] Failed to load the SDK.', e);
  };

  return (
    <Script
      src={TELEGRAM_WEB_APP_SCRIPT_SRC}
      strategy="afterInteractive"
      onReady={handleReady}
      onError={handleError}
    />
  );
}
