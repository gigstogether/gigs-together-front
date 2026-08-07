'use client';

import { useCallback, useEffect, useState } from 'react';
import SignInModal from '@/components/header/SignInModal';
import { toast } from '@/hooks/use-toast';
import { ApiError } from '@/lib/api-errors';
import { subscribeTelegramSignInRequest } from '@/lib/telegram/telegram-auth';
import { clientEnv } from '@/env/client-env';
import { exchangeTelegramAuthFromOidc } from '@/lib/telegram/telegram-auth';
import type { TelegramOidcCredentials } from '@/lib/telegram/telegram-auth';

export default function HeaderSignInModal() {
  const [signInModalOpen, setSignInModalOpen] = useState(false);

  const telegramOidcClientId = clientEnv.telegramOidcClientId;

  const handleAuthenticated = useCallback(async (credentials: TelegramOidcCredentials) => {
    try {
      const { profile } = await exchangeTelegramAuthFromOidc(credentials);
      toast({
        title: 'Signed in',
        description: profile.displayLabel,
      });
    } catch (e) {
      const description =
        e instanceof ApiError ? e.message : 'Could not complete sign in. Please try again.';
      toast({
        title: 'Sign in failed',
        description,
        variant: 'destructive',
      });
    }
  }, []);

  useEffect(() => {
    return subscribeTelegramSignInRequest(() => {
      setSignInModalOpen(true);
    });
  }, []);

  return (
    <SignInModal
      isOpen={signInModalOpen}
      onOpenChange={setSignInModalOpen}
      telegramOidcClientId={telegramOidcClientId}
      onAuthenticated={handleAuthenticated}
    />
  );
}
