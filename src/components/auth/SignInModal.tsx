'use client';

import type { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export interface SignInModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  children: ReactNode;
}

export default function SignInModal(props: SignInModalProps) {
  const { isOpen, onOpenChange, children } = props;

  if (!isOpen) {
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
        <DialogHeader>
          <DialogTitle>Sign in</DialogTitle>
          <DialogDescription>
            Continue with the button below to sign in to your account.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center pt-1">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
