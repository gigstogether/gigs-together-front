'use client';

import SignInContent from '@/app/_components/SignInContent';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
