import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import {
  bootstrapTelegramAuthFromWebApp,
  clearStoredTelegramClientProfile,
  exchangeTelegramAuthFromLoginWidget,
  getTelegramMiniAppBootstrapSnapshot,
  getTelegramClientProfileSnapshot,
  signOutTelegramAuthOnServer,
  subscribeTelegramMiniAppBootstrap,
  subscribeTelegramClientProfile,
} from '@/lib/telegram-auth';
import type { TelegramAuthExchangeResponse } from '@/types/telegram-auth-exchange-response';
import type { TelegramAuthState } from '@/types/telegram-auth';
import type { TelegramWidgetUser } from '@/types/telegram-login';

function subscribeNoop(): () => void {
  return () => undefined;
}

export interface UseTelegramAuthResult {
  readonly authState: TelegramAuthState | null;
  readonly isLoadingAuthState: boolean;
  readonly signIn: (user: TelegramWidgetUser) => Promise<TelegramAuthExchangeResponse>;
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
  const isTelegramMiniAppBootstrapPending = useSyncExternalStore(
    subscribeTelegramMiniAppBootstrap,
    getTelegramMiniAppBootstrapSnapshot,
    () => false,
  );
  const hasAttemptedMiniAppBootstrapRef = useRef(false);

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

  useEffect(() => {
    if (!isHydrated || authState || hasAttemptedMiniAppBootstrapRef.current) {
      return;
    }

    hasAttemptedMiniAppBootstrapRef.current = true;
    void bootstrapTelegramAuthFromWebApp();
  }, [authState, isHydrated]);

  return {
    authState,
    isLoadingAuthState: !isHydrated || isTelegramMiniAppBootstrapPending,
    signIn,
    signOut,
  };
}
