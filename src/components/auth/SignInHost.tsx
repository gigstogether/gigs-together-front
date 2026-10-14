'use client';

import { useEffect, useState } from 'react';
import TelegramSignInModal from '@/components/auth/TelegramSignInModal';
import { subscribeTelegramSignInRequest } from '@/lib/telegram/telegram-auth';

export default function SignInHost() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    return subscribeTelegramSignInRequest(() => {
      setIsOpen(true);
    });
  }, []);

  return (
    <TelegramSignInModal
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    />
  );
}
