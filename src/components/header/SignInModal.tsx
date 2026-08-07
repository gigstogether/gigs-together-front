'use client';

import SignInContent from '@/components/header/SignInContent';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { TelegramOidcCredentials } from '@/lib/telegram/telegram-auth';
export interface SignInModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  telegramOidcClientId: number | undefined;
  onAuthenticated: (credentials: TelegramOidcCredentials) => void | Promise<void>;
}

export default function SignInModal(props: SignInModalProps) {
  const { isOpen, onOpenChange, telegramOidcClientId, onAuthenticated } = props;

  if (!isOpen || !telegramOidcClientId) {
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
          telegramOidcClientId={telegramOidcClientId}
          onAuthenticated={async (credentials) => {
            await onAuthenticated(credentials);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
