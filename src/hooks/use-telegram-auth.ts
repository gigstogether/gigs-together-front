'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import type { TelegramExchangeResponse } from '@/lib/telegram-access-token';
import {
  clearStoredTelegramAccessToken,
  exchangeTelegramAccessTokenFromLoginWidget,
  getTelegramAccessDisplayLabelFromToken,
  getTelegramAccessTokenSnapshot,
  getTelegramPhotoUrlFromAccessToken,
  isTelegramAccessTokenExpired,
  subscribeTelegramAccessToken,
} from '@/lib/telegram-access-token';
import type { TelegramAuthState } from '@/types/telegram-auth';
import type { TelegramWidgetUser } from '@/types/telegram-login';

export interface UseTelegramAuthResult {
  readonly authState: TelegramAuthState | null;
  readonly login: (user: TelegramWidgetUser) => Promise<TelegramExchangeResponse>;
  readonly logout: () => void;
}

export function useTelegramAuth(): UseTelegramAuthResult {
  const tokenSnapshot = useSyncExternalStore(
    subscribeTelegramAccessToken,
    getTelegramAccessTokenSnapshot,
    () => null,
  );

  const authState = useMemo((): TelegramAuthState | null => {
    if (!tokenSnapshot || isTelegramAccessTokenExpired(tokenSnapshot)) {
      return null;
    }
    const label = getTelegramAccessDisplayLabelFromToken(tokenSnapshot);
    if (!label) {
      return null;
    }
    const photoUrl = getTelegramPhotoUrlFromAccessToken(tokenSnapshot);
    return {
      displayLabel: label,
      ...(photoUrl ? { photoUrl } : {}),
    };
  }, [tokenSnapshot]);

  const login = useCallback(async (user: TelegramWidgetUser) => {
    return exchangeTelegramAccessTokenFromLoginWidget(user);
  }, []);

  const logout = useCallback(() => {
    clearStoredTelegramAccessToken();
  }, []);

  return { authState, login, logout };
}
