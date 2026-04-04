'use client';

import { LogIn, LogOut } from 'lucide-react';
import type { TelegramWidgetUser } from '@/types/telegram-login';

const menuRowClass =
  'flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted';

export interface HeaderAuthActionsProps {
  readonly telegramBotUsername?: string;
  readonly session: TelegramWidgetUser | null;
  readonly onLoginClick: () => void;
  readonly onLogout: () => void;
}

export default function HeaderAuthActions(props: HeaderAuthActionsProps) {
  const { telegramBotUsername, session, onLoginClick, onLogout } = props;

  if (!telegramBotUsername?.trim()) {
    return null;
  }

  return (
    <>
      {session ? (
        <button
          type="button"
          className={menuRowClass}
          onClick={onLogout}
          aria-label="Log out"
        >
          <LogOut
            className="h-4 w-4 shrink-0"
            aria-hidden
          />
          Logout
        </button>
      ) : (
        <button
          type="button"
          className={menuRowClass}
          onClick={onLoginClick}
          aria-label="Log in"
        >
          <LogIn
            className="h-4 w-4 shrink-0"
            aria-hidden
          />
          Login
        </button>
      )}
      <div
        className="my-0.5 h-px w-full bg-border/40"
        aria-hidden
      />
    </>
  );
}
