import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import { clientEnv } from '@/env/client-env';
import { useTelegramMiniAppEnv } from '@/hooks/use-telegram-mini-app-env';
import {
  clearStoredTelegramClientProfile,
  getTelegramClientProfileSnapshot,
  signInWithTelegram,
  signOutTelegramAuthOnServer,
  subscribeTelegramClientProfile,
} from '@/lib/telegram/telegram-auth';
import type { TelegramAuthState } from '@/lib/telegram/telegram-auth.types';
import { getTelegramLaunchParamsSnapshot } from '@/lib/telegram/telegram-webapp';

function subscribeNoop(): () => void {
  return () => undefined;
}

export interface UseTelegramAuthResult {
  readonly authState: TelegramAuthState | null;
  readonly isLoadingAuthState: boolean;
  readonly isSigningIn: boolean;
  readonly isTelegramSignInAvailable: boolean;
  readonly signIn: () => Promise<void>;
  readonly signOut: () => Promise<void>;
}

export function useTelegramAuth(): UseTelegramAuthResult {
  // `authState` comes from localStorage, so SSR always sees "signed out". We use
  // `useSyncExternalStore` with a server snapshot of `false` and a client snapshot of `true` to
  // detect when hydration has completed. This lets screens show a short loading state until the
  // client snapshot is available, avoiding a flash of the sign-in UI for already authenticated users.
  const isHydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const profileSnapshot = useSyncExternalStore(
    subscribeTelegramClientProfile,
    getTelegramClientProfileSnapshot,
    () => null,
  );
  const miniAppEnv = useTelegramMiniAppEnv();
  const [isSigningIn, setIsSigningIn] = useState(false);
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

  const signOut = useCallback(async () => {
    await signOutTelegramAuthOnServer();
    clearStoredTelegramClientProfile();
  }, []);

  const isTelegramSignInAvailable =
    clientEnv.isAuthEnabled &&
    (miniAppEnv === 'mini'
      ? Boolean(getTelegramLaunchParamsSnapshot()?.initData)
      : miniAppEnv === 'browser' && Boolean(clientEnv.telegramOidcClientId));

  const signIn = useCallback(async (): Promise<void> => {
    if (!isTelegramSignInAvailable) {
      throw new Error('Telegram sign-in is not available in this environment.');
    }

    setIsSigningIn(true);
    try {
      await signInWithTelegram();
    } finally {
      setIsSigningIn(false);
    }
  }, [isTelegramSignInAvailable]);

  return {
    authState,
    isLoadingAuthState: !isHydrated,
    isSigningIn,
    isTelegramSignInAvailable,
    signIn,
    signOut,
  };
}
