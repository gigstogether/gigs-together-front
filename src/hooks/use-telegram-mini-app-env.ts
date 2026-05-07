import { useLayoutEffect, useState } from 'react';
import { isTelegramMiniApp } from '@/lib/telegram-webapp';

export type TelegramMiniAppEnv = 'unknown' | 'mini' | 'browser';

export function useTelegramMiniAppEnv(): TelegramMiniAppEnv {
  const [miniAppEnv, setMiniAppEnv] = useState<TelegramMiniAppEnv>('unknown');

  useLayoutEffect(() => {
    const resolve = (): void => {
      setMiniAppEnv(isTelegramMiniApp() ? 'mini' : 'browser');
    };

    resolve();
    // The Telegram Web App script may attach shortly after first paint.
    const timeouts = [50, 200, 600].map((ms) => window.setTimeout(resolve, ms));
    return () => timeouts.forEach((id) => window.clearTimeout(id));
  }, []);

  return miniAppEnv;
}
