'use client';

import { LogIn, LogOut } from 'lucide-react';
import type { TelegramAuthState } from '@/types/telegram-auth';

const menuRowClass =
  'flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted';

export interface HeaderAuthActionsProps {
  readonly telegramBotUsername?: string;
  readonly authState: TelegramAuthState | null;
  readonly onLoginClick: () => void;
  readonly onLogout: () => void;
}

export default function HeaderAuthActions(props: HeaderAuthActionsProps) {
  const { telegramBotUsername, authState, onLoginClick, onLogout } = props;

  if (!telegramBotUsername?.trim()) {
    return null;
  }

  return (
    <>
      {authState ? (
        <div className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm">
          <div className="flex min-w-0 flex-1 cursor-default items-center gap-2">
            {authState.photoUrl ? (
              <span className="relative inline-flex h-8 w-8 shrink-0 overflow-hidden rounded-full bg-muted">
                <img
                  src={authState.photoUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </span>
            ) : null}
            <span
              className="min-w-0 flex-1 truncate font-medium text-foreground"
              title={authState.displayLabel}
            >
              {authState.displayLabel}
            </span>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground"
            onClick={onLogout}
            aria-label="Log out"
            title="Log out"
          >
            <LogOut
              className="h-4 w-4"
              aria-hidden
            />
          </button>
        </div>
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
