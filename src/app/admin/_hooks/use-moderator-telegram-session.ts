import { useCallback } from 'react';
import { clientEnv } from '@/env/client-env';
import type { TelegramMiniAppEnv } from '@/hooks/use-telegram-mini-app-env';
import { useTelegramMiniAppEnv } from '@/hooks/use-telegram-mini-app-env';
import { toast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/hooks/use-telegram-auth';
import type { TelegramAuthState } from '@/lib/telegram/telegram-auth.types';

export interface UseModeratorTelegramSessionResult {
  readonly authState: TelegramAuthState | null;
  readonly isLoadingAuthState: boolean;
  readonly hasTelegramMiniAppAuthError: boolean;
  readonly isTelegramSignInAvailable: boolean;
  readonly miniAppEnv: TelegramMiniAppEnv;
  readonly handleSignOut: () => Promise<void>;
}

export function useModeratorTelegramSession(): UseModeratorTelegramSessionResult {
  const { authState, isLoadingAuthState, hasTelegramMiniAppAuthError, signOut } = useTelegramAuth();

  const isTelegramSignInAvailable = Boolean(clientEnv.telegramOidcClientId);
  const miniAppEnv = useTelegramMiniAppEnv();

  const handleSignOut = useCallback(async () => {
    await signOut();
    toast({
      title: 'Signed out',
      ...(authState?.displayLabel ? { description: authState.displayLabel } : {}),
    });
  }, [authState, signOut]);

  return {
    authState,
    isLoadingAuthState,
    hasTelegramMiniAppAuthError,
    isTelegramSignInAvailable,
    miniAppEnv,
    handleSignOut,
  };
}
