'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import type { TelegramOidcCredentials } from '@/lib/telegram/telegram-auth';
import type { TelegramLoginResult } from '@/lib/types';

const TELEGRAM_LOGIN_SCRIPT_SRC = 'https://oauth.telegram.org/js/telegram-login.js?3';

export interface TelegramLoginButtonProps {
  clientId: number;
  onAuth: (credentials: TelegramOidcCredentials) => void | Promise<void>;
}

export default function TelegramLoginButton(props: TelegramLoginButtonProps) {
  const { clientId, onAuth } = props;

  const [isReady, setIsReady] = useState(
    () => typeof window !== 'undefined' && Boolean(window.Telegram?.Login),
  );
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (window.Telegram?.Login) {
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${TELEGRAM_LOGIN_SCRIPT_SRC}"]`,
    );
    const script = existingScript ?? document.createElement('script');
    const handleLoad = (): void => {
      if (!window.Telegram?.Login) {
        toast({
          title: 'Sign in unavailable',
          description: 'Telegram Login loaded without its expected API.',
          variant: 'destructive',
        });
        return;
      }
      setIsReady(true);
    };
    const handleError = (): void => {
      toast({
        title: 'Sign in unavailable',
        description: 'Could not load Telegram Login. Please try again.',
        variant: 'destructive',
      });
    };
    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);
    if (!existingScript) {
      script.src = TELEGRAM_LOGIN_SCRIPT_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
    return () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
    };
  }, []);

  const handleLoginResult = async (result: TelegramLoginResult): Promise<void> => {
    if (result.error || !result.id_token) {
      setIsPending(false);
      toast({
        title: 'Sign in failed',
        description: result.error?.trim() || 'Telegram did not return an ID token.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await onAuth({ idToken: result.id_token });
    } catch (e) {
      toast({
        title: 'Sign in failed',
        description: e instanceof Error ? e.message : 'Could not complete Telegram sign-in.',
        variant: 'destructive',
      });
    } finally {
      setIsPending(false);
    }
  };

  const handleClick = (): void => {
    const login = window.Telegram?.Login;
    if (!login) {
      toast({
        title: 'Sign in unavailable',
        description: 'Telegram Login is not ready.',
        variant: 'destructive',
      });
      return;
    }

    setIsPending(true);
    login.auth({ client_id: clientId, scope: ['profile'] }, (result) => {
      void handleLoginResult(result);
    });
  };

  return (
    <Button
      type="button"
      className="bg-[#229ED9] text-white hover:bg-[#229ED9]/90"
      disabled={!isReady || isPending}
      onClick={handleClick}
    >
      {isPending ? 'Signing in…' : 'Log in with Telegram'}
    </Button>
  );
}
