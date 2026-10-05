import { useCallback } from 'react';
import type { TelegramMiniAppEnv } from '@/hooks/use-telegram-mini-app-env';
import { useTelegramMiniAppEnv } from '@/hooks/use-telegram-mini-app-env';
import { toast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/hooks/use-telegram-auth';
import type { TelegramAuthState } from '@/lib/telegram/telegram-auth.types';

export interface UseModeratorTelegramSessionResult {
  readonly authState: TelegramAuthState | null;
  readonly isLoadingAuthState: boolean;
  readonly isSigningIn: boolean;
  readonly isTelegramSignInAvailable: boolean;
  readonly miniAppEnv: TelegramMiniAppEnv;
  readonly handleSignIn: () => Promise<void>;
  readonly handleSignOut: () => Promise<void>;
}

export function useModeratorTelegramSession(): UseModeratorTelegramSessionResult {
  const { authState, isLoadingAuthState, isSigningIn, isTelegramSignInAvailable, signIn, signOut } =
    useTelegramAuth();

  const miniAppEnv = useTelegramMiniAppEnv();

  const handleSignIn = useCallback(async () => {
    try {
      await signIn();
    } catch (e) {
      toast({
        title: 'Sign in failed',
        description: e instanceof Error ? e.message : 'Could not complete Telegram sign-in.',
        variant: 'destructive',
      });
    }
  }, [signIn]);

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
