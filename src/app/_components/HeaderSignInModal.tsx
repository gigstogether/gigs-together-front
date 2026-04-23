'use client';

import { useCallback, useEffect, useState } from 'react';
import SignInModal from '@/app/_components/SignInModal';
import { toast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/hooks/use-telegram-auth';
import { ApiError } from '@/lib/api-errors';
import { subscribeTelegramSignInRequest } from '@/lib/telegram-auth';
import type { TelegramWidgetUser } from '@/types/telegram-login';
import { clientEnv } from '@/env/client-env';

export default function HeaderSignInModal() {
  const { signIn } = useTelegramAuth();
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const telegramBotUsername = clientEnv.isAuthEnabled ? clientEnv.telegramBotUsername : undefined;

  const handleAuthenticated = useCallback(
    async (user: TelegramWidgetUser) => {
      try {
        const { profile } = await signIn(user);
        const label =
          profile.displayLabel || (user.username ? `@${user.username}` : user.first_name);
        toast({
          title: 'Signed in',
          description: label,
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

  useEffect(() => {
    return subscribeTelegramSignInRequest(() => {
      setSignInModalOpen(true);
    });
  }, []);

  return (
    <SignInModal
      isOpen={signInModalOpen}
      onOpenChange={setSignInModalOpen}
      telegramBotUsername={telegramBotUsername}
      onAuthenticated={handleAuthenticated}
    />
  );
}
