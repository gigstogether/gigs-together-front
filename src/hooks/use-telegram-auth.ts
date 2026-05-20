import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useMe } from '@/hooks/use-me';
import { bootstrapMiniAppSessionAndRefreshMe, setAuthMeProfileQueryData } from '@/lib/auth-me';
import {
  clearStoredTelegramClientProfile,
  exchangeTelegramAuthFromLoginWidget,
  getTelegramMiniAppBootstrapSnapshot,
  signOutTelegramAuthOnServer,
  subscribeTelegramMiniAppBootstrap,
} from '@/lib/telegram-auth';
import type { TelegramAuthExchangeResponse } from '@/types/telegram-auth-exchange-response';
import type { TelegramAuthState } from '@/types/telegram-auth';
import type { TelegramWidgetUser } from '@/types/telegram-login';

export interface UseTelegramAuthResult {
  readonly authState: TelegramAuthState | null;
  readonly isLoadingAuthState: boolean;
  readonly signIn: (user: TelegramWidgetUser) => Promise<TelegramAuthExchangeResponse>;
  readonly signOut: () => Promise<void>;
}

export function useTelegramAuth(): UseTelegramAuthResult {
  const queryClient = useQueryClient();
  const { data: profile, isPending } = useMe();
  const isTelegramMiniAppBootstrapPending = useSyncExternalStore(
    subscribeTelegramMiniAppBootstrap,
    getTelegramMiniAppBootstrapSnapshot,
    () => false,
  );
  const hasAttemptedMiniAppBootstrapRef = useRef(false);

  const authState = useMemo((): TelegramAuthState | null => {
    if (profile == null) {
      return null;
    }
    return profile;
  }, [profile]);

  const signIn = useCallback(
    async (user: TelegramWidgetUser) => {
      const response = await exchangeTelegramAuthFromLoginWidget(user);
      setAuthMeProfileQueryData(queryClient, response.profile);
      return response;
    },
    [queryClient],
  );

  const signOut = useCallback(async () => {
    await signOutTelegramAuthOnServer();
    setAuthMeProfileQueryData(queryClient, null);
    clearStoredTelegramClientProfile();
  }, [queryClient]);

  useEffect(() => {
    if (isPending || authState || hasAttemptedMiniAppBootstrapRef.current) {
      return;
    }

    hasAttemptedMiniAppBootstrapRef.current = true;
    void bootstrapMiniAppSessionAndRefreshMe(queryClient);
  }, [authState, isPending, queryClient]);

  return {
    authState,
    isLoadingAuthState: isPending || isTelegramMiniAppBootstrapPending,
    signIn,
    signOut,
  };
}
