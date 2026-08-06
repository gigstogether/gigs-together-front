import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import {
  bootstrapTelegramAuthFromWebApp,
  clearStoredTelegramClientProfile,
  exchangeTelegramAuthFromLoginWidget,
  getTelegramMiniAppBootstrapSnapshot,
  getTelegramClientProfileSnapshot,
  signOutTelegramAuthOnServer,
  subscribeTelegramMiniAppBootstrap,
  subscribeTelegramClientProfile,
} from '@/lib/telegram/telegram-auth';
import type { TelegramAuthExchangeResponse } from '@/lib/telegram/telegram-auth-exchange-response.types';
import type { TelegramAuthState } from '@/lib/telegram/telegram-auth.types';
import type { TelegramWidgetUser } from '@/lib/telegram/telegram-login.types';

function subscribeNoop(): () => void {
  return () => undefined;
}

export interface UseTelegramAuthResult {
  readonly authState: TelegramAuthState | null;
  readonly isLoadingAuthState: boolean;
  readonly hasTelegramMiniAppAuthError: boolean;
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
  const [hasTelegramMiniAppAuthError, setHasTelegramMiniAppAuthError] = useState(false);

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

    const bootstrap = async (): Promise<void> => {
      hasAttemptedMiniAppBootstrapRef.current = true;
      const result = await bootstrapTelegramAuthFromWebApp();
      setHasTelegramMiniAppAuthError(result === 'failed');
    };

    void bootstrap();
  }, [authState, isHydrated]);

  return {
    authState,
    isLoadingAuthState: !isHydrated || isTelegramMiniAppBootstrapPending,
    hasTelegramMiniAppAuthError,
    signIn,
    signOut,
  };
}
