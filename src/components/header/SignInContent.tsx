'use client';

import TelegramLoginButton from '@/components/header/TelegramLoginButton';
import type { TelegramOidcCredentials } from '@/lib/telegram/telegram-auth';
export interface SignInContentProps {
  telegramOidcClientId: number | undefined;
  onAuthenticated: (credentials: TelegramOidcCredentials) => void | Promise<void>;
}

export default function SignInContent(props: SignInContentProps) {
  const { telegramOidcClientId, onAuthenticated } = props;

  if (!telegramOidcClientId) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col space-y-1.5 text-center sm:text-left">
        <h2 className="text-lg font-semibold leading-none tracking-tight">Sign in</h2>
        <p className="text-sm text-muted-foreground">
          Continue with the button below to sign in to your account.
        </p>
      </div>
      <div className="flex justify-center pt-1">
        <TelegramLoginButton
          clientId={telegramOidcClientId}
          onAuth={onAuthenticated}
        />
      </div>
    </>
  );
}
