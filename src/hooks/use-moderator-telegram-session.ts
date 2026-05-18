import { useCallback } from 'react';
import { clientEnv } from '@/env/client-env';
import type { TelegramMiniAppEnv } from '@/hooks/use-telegram-mini-app-env';
import { useTelegramMiniAppEnv } from '@/hooks/use-telegram-mini-app-env';
import { toast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/hooks/use-telegram-auth';
import { ApiError } from '@/lib/api-errors';
import type { TelegramAuthState } from '@/types/telegram-auth';
import type { TelegramWidgetUser } from '@/types/telegram-login';

export interface UseModeratorTelegramSessionResult {
  readonly authState: TelegramAuthState | null;
  readonly isLoadingAuthState: boolean;
  readonly telegramBotUsername: string | undefined;
  readonly isTelegramSignInAvailable: boolean;
  readonly miniAppEnv: TelegramMiniAppEnv;
  readonly handleAuthenticated: (user: TelegramWidgetUser) => Promise<void>;
  readonly handleSignOut: () => Promise<void>;
}

export function useModeratorTelegramSession(): UseModeratorTelegramSessionResult {
  const { authState, isLoadingAuthState, signIn, signOut } = useTelegramAuth();
  const telegramBotUsername = clientEnv.isAuthEnabled ? clientEnv.telegramBotUsername : undefined;
  const isTelegramSignInAvailable = Boolean(telegramBotUsername?.trim());
  const miniAppEnv = useTelegramMiniAppEnv();

  const handleAuthenticated = useCallback(
    async (user: TelegramWidgetUser) => {
      try {
        const { profile } = await signIn(user);
        const label =
          profile.displayLabel || (user.username ? `@${user.username}` : user.first_name);
        if (profile.isAdmin) {
          toast({
            title: 'Signed in',
            description: label,
          });
          return;
        }
        toast({
          title: 'Access denied',
          description: 'This page is available only for admin accounts.',
          variant: 'destructive',
        });
      } catch (error) {
        const description =
          error instanceof ApiError
            ? error.message
            : 'Could not complete sign in. Please try again.';
        toast({
          title: 'Sign in failed',
          description,
          variant: 'destructive',
        });
      }
    },
    [signIn],
  );

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
    telegramBotUsername,
    isTelegramSignInAvailable,
    miniAppEnv,
    handleAuthenticated,
    handleSignOut,
  };
}
