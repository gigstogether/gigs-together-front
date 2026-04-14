'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import {
  clearStoredTelegramClientProfile,
  exchangeTelegramAuthFromLoginWidget,
  getTelegramClientProfileSnapshot,
  signOutTelegramAuthOnServer,
  subscribeTelegramClientProfile,
} from '@/lib/telegram-auth';
import type { TelegramAuthExchangeResponse } from '@/types/telegram-auth-exchange-response';
import type { TelegramAuthState } from '@/types/telegram-auth';
import type { TelegramWidgetUser } from '@/types/telegram-login';

export interface UseTelegramAuthResult {
  readonly authState: TelegramAuthState | null;
  readonly signIn: (user: TelegramWidgetUser) => Promise<TelegramAuthExchangeResponse>;
  readonly signOut: () => Promise<void>;
}

export function useTelegramAuth(): UseTelegramAuthResult {
  const profileSnapshot = useSyncExternalStore(
    subscribeTelegramClientProfile,
    getTelegramClientProfileSnapshot,
    () => null,
  );

  const authState = useMemo((): TelegramAuthState | null => {
    if (!profileSnapshot) {
      return null;
    }
    return {
      displayLabel: profileSnapshot.displayLabel,
      ...(profileSnapshot.photoUrl ? { photoUrl: profileSnapshot.photoUrl } : {}),
      isAdmin: profileSnapshot.isAdmin,
    };
  }, [profileSnapshot]);

  const signIn = useCallback(async (user: TelegramWidgetUser) => {
    return exchangeTelegramAuthFromLoginWidget(user);
  }, []);

  const signOut = useCallback(async () => {
    await signOutTelegramAuthOnServer();
    clearStoredTelegramClientProfile();
  }, []);

  return { authState, signIn, signOut };
}
