'use client';

import SignInContent from '@/app/_components/SignInContent';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import type { TelegramWidgetUser } from '@/types/telegram-login';

export interface SignInModalProps {
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly telegramBotUsername: string | undefined;
  readonly onAuthenticated: (user: TelegramWidgetUser) => void | Promise<void>;
}

export default function SignInModal(props: SignInModalProps) {
  const { isOpen, onOpenChange, telegramBotUsername, onAuthenticated } = props;

  const botUsername = telegramBotUsername?.trim();
  if (!botUsername) {
    return null;
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-sm">
        <DialogTitle className="sr-only">Sign in</DialogTitle>
        <DialogDescription className="sr-only">
          Continue with the button below to sign in to your account.
        </DialogDescription>
        {isOpen ? (
          <SignInContent
            telegramBotUsername={botUsername}
            onAuthenticated={async (user) => {
              await onAuthenticated(user);
              onOpenChange(false);
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
