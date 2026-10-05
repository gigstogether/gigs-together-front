import { useCallback, useMemo, useSyncExternalStore } from 'react';
import {
  clearStoredTelegramClientProfile,
  getTelegramClientProfileSnapshot,
  signOutTelegramAuthOnServer,
  subscribeTelegramClientProfile,
} from '@/lib/telegram/telegram-auth';
import type { TelegramAuthState } from '@/lib/telegram/telegram-auth.types';

function subscribeNoop(): () => void {
  return () => undefined;
}

export interface UseTelegramAuthResult {
  readonly authState: TelegramAuthState | null;
  readonly isLoadingAuthState: boolean;
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

  return {
    authState,
    isLoadingAuthState: !isHydrated,
    signOut,
  };
}
