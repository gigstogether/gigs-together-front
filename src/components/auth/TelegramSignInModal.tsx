'use client';

import { useCallback } from 'react';
import SignInModal from '@/components/auth/SignInModal';
import TelegramLoginButton from '@/components/auth/TelegramLoginButton';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/hooks/use-telegram-auth';
import { useTelegramMiniAppEnv } from '@/hooks/use-telegram-mini-app-env';
import { ApiError } from '@/lib/api-errors';
import { clientEnv } from '@/env/client-env';
import { exchangeTelegramAuthFromOidc } from '@/lib/telegram/telegram-auth';
import type { TelegramOidcCredentials } from '@/lib/telegram/telegram-auth';

export interface TelegramSignInModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function TelegramSignInModal(props: TelegramSignInModalProps) {
  const { isOpen, onOpenChange } = props;

  const { isSigningIn, isTelegramSignInAvailable, signIn } = useTelegramAuth();
  const miniAppEnv = useTelegramMiniAppEnv();
  const telegramOidcClientId = clientEnv.telegramOidcClientId;

  const handleAuthenticated = useCallback(
    async (credentials: TelegramOidcCredentials) => {
      try {
        const { profile } = await exchangeTelegramAuthFromOidc(credentials);
        toast({
          title: 'Signed in',
          description: profile.displayLabel,
        });
        onOpenChange(false);
      } catch (e) {
        const description =
          e instanceof ApiError ? e.message : 'Could not complete sign in. Please try again.';
        toast({
          title: 'Sign in failed',
          description,
          variant: 'destructive',
        });
      }
    },
    [onOpenChange],
  );

  const handleMiniAppSignIn = useCallback(async (): Promise<void> => {
    try {
      await signIn();
      toast({ title: 'Signed in' });
      onOpenChange(false);
    } catch (e) {
      toast({
        title: 'Sign in failed',
        description: e instanceof Error ? e.message : 'Could not complete Telegram sign-in.',
        variant: 'destructive',
      });
    }
  }, [onOpenChange, signIn]);

  if (!isTelegramSignInAvailable) {
    return null;
  }

  return (
    <SignInModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      {miniAppEnv === 'mini' ? (
        <Button
          type="button"
          className="bg-[#229ED9] text-white hover:bg-[#229ED9]/90"
          disabled={isSigningIn}
          onClick={() => {
            void handleMiniAppSignIn();
          }}
        >
          {isSigningIn ? 'Signing in…' : 'Log in with Telegram'}
        </Button>
      ) : telegramOidcClientId ? (
        <TelegramLoginButton
          clientId={telegramOidcClientId}
          onAuth={handleAuthenticated}
        />
      ) : null}
    </SignInModal>
  );
}
