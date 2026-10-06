import { useCallback } from 'react';
import type { TelegramMiniAppEnv } from '@/hooks/use-telegram-mini-app-env';
import { useTelegramMiniAppEnv } from '@/hooks/use-telegram-mini-app-env';
import { toast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/hooks/use-telegram-auth';
import type { TelegramAuthState } from '@/lib/telegram/telegram-auth.types';
import { requestTelegramSignIn } from '@/lib/telegram/telegram-auth';

export interface UseModeratorTelegramSessionResult {
  readonly authState: TelegramAuthState | null;
  readonly isLoadingAuthState: boolean;
  readonly isSigningIn: boolean;
  readonly isTelegramSignInAvailable: boolean;
  readonly miniAppEnv: TelegramMiniAppEnv;
  readonly handleSignIn: () => void;
  readonly handleSignOut: () => Promise<void>;
}

export function useModeratorTelegramSession(): UseModeratorTelegramSessionResult {
  const { authState, isLoadingAuthState, isSigningIn, isTelegramSignInAvailable, signOut } =
    useTelegramAuth();

  const miniAppEnv = useTelegramMiniAppEnv();

  const handleSignIn = useCallback((): void => {
    requestTelegramSignIn();
  }, []);

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
    isSigningIn,
    isTelegramSignInAvailable,
    miniAppEnv,
    handleSignIn,
    handleSignOut,
  };
}
