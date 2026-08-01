'use client';

import TelegramLoginWidget from '@/components/header/TelegramLoginWidget';
import type { TelegramWidgetUser } from '@/types/telegram-login';

export interface SignInContentProps {
  readonly telegramBotUsername: string | undefined;
  readonly onAuthenticated: (user: TelegramWidgetUser) => void | Promise<void>;
}

export default function SignInContent(props: SignInContentProps) {
  const { telegramBotUsername, onAuthenticated } = props;

  const botUsername = telegramBotUsername?.trim();
  if (!botUsername) {
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
        <TelegramLoginWidget
          botUsername={botUsername}
          size="large"
          onAuth={onAuthenticated}
        />
      </div>
    </>
  );
}
