'use client';

import { LogIn, LogOut } from 'lucide-react';
import type { TelegramMiniAppEnv } from '@/hooks/use-telegram-mini-app-env';
import type { TelegramAuthState } from '@/types/telegram-auth';

const menuRowClass =
  'flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted';

export interface HeaderAuthActionsProps {
  readonly telegramBotUsername?: string;
  readonly authState: TelegramAuthState | null;
  readonly miniAppEnv: TelegramMiniAppEnv;
  readonly onSignInClick: () => void;
  readonly onSignOut: () => void | Promise<void>;
}

export default function HeaderAuthActions(props: HeaderAuthActionsProps) {
  const { telegramBotUsername, authState, miniAppEnv, onSignInClick, onSignOut } = props;

  if (!telegramBotUsername?.trim()) {
    return null;
  }

  const showSignInButton = !authState && miniAppEnv === 'browser';
  const showSignOutButton = authState && miniAppEnv !== 'mini';

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
          {showSignOutButton ? (
            <button
              type="button"
              className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground"
              onClick={() => {
                void onSignOut();
              }}
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut
                className="h-4 w-4"
                aria-hidden
              />
            </button>
          ) : null}
        </div>
      ) : showSignInButton ? (
        <button
          type="button"
          className={menuRowClass}
          onClick={onSignInClick}
          aria-label="Sign in"
        >
          <LogIn
            className="h-4 w-4 shrink-0"
            aria-hidden
          />
          Sign in
        </button>
      ) : null}
      {(authState || showSignInButton) && (
        <div
          className="my-0.5 h-px w-full bg-border/40"
          aria-hidden
        />
      )}
    </>
  );
}
