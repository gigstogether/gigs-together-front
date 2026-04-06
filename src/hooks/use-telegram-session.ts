'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import type { TelegramExchangeResponse } from '@/lib/telegram-access-token';
import {
  clearStoredTelegramAccessToken,
  exchangeTelegramAccessTokenFromLoginWidget,
  getTelegramAccessDisplayLabelFromToken,
  getTelegramAccessTokenSnapshot,
  isTelegramAccessTokenExpired,
  subscribeTelegramAccessToken,
} from '@/lib/telegram-access-token';
import type { TelegramAuthSession } from '@/types/telegram-auth';
import type { TelegramWidgetUser } from '@/types/telegram-login';

export interface UseTelegramSessionResult {
  readonly session: TelegramAuthSession | null;
  readonly login: (user: TelegramWidgetUser) => Promise<TelegramExchangeResponse>;
  readonly logout: () => void;
}

export function useTelegramSession(): UseTelegramSessionResult {
  const tokenSnapshot = useSyncExternalStore(
    subscribeTelegramAccessToken,
    getTelegramAccessTokenSnapshot,
    () => null,
  );

  const session = useMemo((): TelegramAuthSession | null => {
    if (!tokenSnapshot || isTelegramAccessTokenExpired(tokenSnapshot)) {
      return null;
    }
    const label = getTelegramAccessDisplayLabelFromToken(tokenSnapshot);
    if (!label) {
      return null;
    }
    return { displayLabel: label };
  }, [tokenSnapshot]);

  const login = useCallback(async (user: TelegramWidgetUser) => {
    return exchangeTelegramAccessTokenFromLoginWidget(user);
  }, []);

  const logout = useCallback(() => {
    clearStoredTelegramAccessToken();
  }, []);

  return { session, login, logout };
}
