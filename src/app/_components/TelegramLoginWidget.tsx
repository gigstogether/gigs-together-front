'use client';

import { useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { exchangeTelegramAuthFromLoginWidget } from '@/lib/telegram-auth';
import type { TelegramWidgetUser } from '@/types/telegram-login';

const TELEGRAM_WIDGET_SCRIPT_SRC = 'https://telegram.org/js/telegram-widget.js?22';

declare global {
  interface Window {
    gigsTogetherTelegramAuth?: (user: TelegramWidgetUser) => void;
  }
}

export interface TelegramLoginWidgetProps {
  readonly botUsername: string;
  readonly size?: 'small' | 'medium' | 'large';
  readonly onAuth?: (user: TelegramWidgetUser) => void | Promise<void>;
  readonly className?: string;
}

async function defaultOnAuth(user: TelegramWidgetUser): Promise<void> {
  try {
    const { profile } = await exchangeTelegramAuthFromLoginWidget(user);
    const label = profile.displayLabel || (user.username ? `@${user.username}` : user.first_name);
    toast({
      title: 'Signed in',
      description: label,
    });
  } catch {
    toast({
      title: 'Sign in failed',
      description: 'Could not complete sign in. Please try again.',
      variant: 'destructive',
    });
  }
}

export default function TelegramLoginWidget(props: TelegramLoginWidgetProps) {
  const { botUsername, size = 'small', onAuth, className } = props;
  const telegramAuthSessionHelpUrl = process.env.NEXT_PUBLIC_TELEGRAM_AUTH_SESSION_HELP_URL?.trim();

  const containerRef = useRef<HTMLDivElement>(null);
  const onAuthRef = useRef(onAuth ?? defaultOnAuth);

  useEffect(() => {
    onAuthRef.current = onAuth ?? defaultOnAuth;
  }, [onAuth]);

  // Load the widget by appending a <script> in an effect (not a static tag in JSX) so the bot name
  // comes from props, the global auth callback exists before the script runs, work stays client-only,
  // and we remove script + callback on unmount when the modal closes (clean reopen, no duplicates).
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !botUsername) {
      return;
    }

    window.gigsTogetherTelegramAuth = (user: TelegramWidgetUser) => {
      onAuthRef.current(user);
    };

    const script = document.createElement('script');
    script.src = TELEGRAM_WIDGET_SCRIPT_SRC;
    script.async = true;
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', size);
    script.setAttribute('data-onauth', 'gigsTogetherTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');

    container.appendChild(script);

    return () => {
      container.replaceChildren();
      delete window.gigsTogetherTelegramAuth;
    };
  }, [botUsername, size]);

  if (!botUsername) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex justify-center">
        <div
          ref={containerRef}
          data-telegram-login-widget
        />
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        To terminate previous Telegram session you can use{' '}
        {telegramAuthSessionHelpUrl ? (
          <a
            href={telegramAuthSessionHelpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-2"
          >
            Telegram service account
          </a>
        ) : (
          <span className="font-medium">service account</span>
        )}
        .
      </p>
    </div>
  );
}
