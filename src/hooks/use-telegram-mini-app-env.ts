import { useSyncExternalStore } from 'react';
import { isTelegramMiniApp } from '@/lib/telegram/telegram-webapp';

export type TelegramMiniAppEnv = 'unknown' | 'mini' | 'browser';

function subscribeNoop(): () => void {
  return () => undefined;
}

export function useTelegramMiniAppEnv(): TelegramMiniAppEnv {
  return useSyncExternalStore(
    subscribeNoop,
    () => (isTelegramMiniApp() ? 'mini' : 'browser'),
    () => 'unknown',
  );
}
