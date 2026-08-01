'use client';

import SignInContent from '@/components/header/SignInContent';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { TelegramWidgetUser } from '@/lib/telegram/telegram-login.types';

export interface SignInModalProps {
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly telegramBotUsername: string | undefined;
  readonly onAuthenticated: (user: TelegramWidgetUser) => void | Promise<void>;
}

export default function SignInModal(props: SignInModalProps) {
  const { isOpen, onOpenChange, telegramBotUsername, onAuthenticated } = props;

  const botUsername = telegramBotUsername?.trim();
  if (!isOpen || !botUsername) {
    return null;
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogTrigger className="hidden">Open sign-in dialog</DialogTrigger>
      <DialogContent
        className="max-w-sm"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
        }}
      >
        <DialogTitle className="sr-only">Sign in</DialogTitle>
        <DialogDescription className="sr-only">
          Continue with the button below to sign in to your account.
        </DialogDescription>
        <SignInContent
          telegramBotUsername={botUsername}
          onAuthenticated={async (user) => {
            await onAuthenticated(user);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
