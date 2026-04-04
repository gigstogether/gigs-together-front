'use client';

import TelegramLoginWidget from '@/app/_components/TelegramLoginWidget';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { TelegramWidgetUser } from '@/types/telegram-login';

export interface LoginModalProps {
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly telegramBotUsername: string | undefined;
  readonly onAuthenticated: (user: TelegramWidgetUser) => void;
}

export default function LoginModal(props: LoginModalProps) {
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
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
          <DialogDescription>
            Continue with the button below to sign in to your account.
          </DialogDescription>
        </DialogHeader>
        {isOpen ? (
          <div className="flex justify-center pt-1">
            <TelegramLoginWidget
              botUsername={botUsername}
              size="large"
              onAuth={(user) => {
                onAuthenticated(user);
                onOpenChange(false);
              }}
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
