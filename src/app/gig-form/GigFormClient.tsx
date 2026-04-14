'use client';

import { useCallback, useLayoutEffect, useState } from 'react';
import SignInContent from '@/app/_components/SignInContent';
import CreateGigFormClient from '@/app/gig-form/CreateGigFormClient';
import EditGigFormClient from '@/app/gig-form/EditGigFormClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/hooks/use-telegram-auth';
import { ApiError } from '@/lib/api-errors';
import type { Country } from '@/lib/countries.server';
import { getTelegramAuthBotUsername } from '@/lib/telegram-auth-env';
import { isTelegramMiniApp } from '@/lib/telegram-webapp';
import type { TelegramWidgetUser } from '@/types/telegram-login';

interface GigFormClientProps {
  countries: Country[];
  mode?: 'create' | 'edit';
  gigPublicId?: string;
}

export default function GigFormClient({
  countries,
  mode = 'create',
  gigPublicId,
}: GigFormClientProps) {
  const { authState, isLoadingAuthState, signIn, signOut } = useTelegramAuth();
  const telegramBotUsername = getTelegramAuthBotUsername();
  const isTelegramSignInAvailable = Boolean(telegramBotUsername?.trim());
  const [miniAppEnv, setMiniAppEnv] = useState<'unknown' | 'mini' | 'browser'>('unknown');

  useLayoutEffect(() => {
    const resolve = (): void => {
      setMiniAppEnv(isTelegramMiniApp() ? 'mini' : 'browser');
    };
    resolve();
    const timeouts = [50, 200, 600].map((ms) => window.setTimeout(resolve, ms));
    return () => timeouts.forEach((id) => window.clearTimeout(id));
  }, []);

  const handleAuthenticated = useCallback(
    async (user: TelegramWidgetUser) => {
      try {
        const { profile } = await signIn(user);
        const label =
          profile.displayLabel || (user.username ? `@${user.username}` : user.first_name);
        if (profile.isAdmin) {
          toast({
            title: 'Signed in',
            description: label,
          });
          return;
        }
        toast({
          title: 'Access denied',
          description: 'This page is available only for admin accounts.',
          variant: 'destructive',
        });
      } catch (error) {
        const description =
          error instanceof ApiError
            ? error.message
            : 'Could not complete sign in. Please try again.';
        toast({
          title: 'Sign in failed',
          description,
          variant: 'destructive',
        });
      }
    },
    [signIn],
  );

  const handleSignOut = useCallback(async () => {
    await signOut();
    toast({
      title: 'Signed out',
      ...(authState?.displayLabel ? { description: authState.displayLabel } : {}),
    });
  }, [authState, signOut]);

  if (isLoadingAuthState) {
    return (
      <div className="flex items-center justify-center py-6">
        <span className="text-base text-muted-foreground">Loading…</span>
      </div>
    );
  }

  if (!authState) {
    return (
      <div className="flex items-center justify-center py-6">
        <Card className="w-full max-w-md m-auto border-0">
          <CardContent className="space-y-2 pt-6">
            {isTelegramSignInAvailable ? (
              <SignInContent
                telegramBotUsername={telegramBotUsername}
                onAuthenticated={handleAuthenticated}
              />
            ) : (
              <>
                <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                  <h2 className="text-lg font-semibold leading-none tracking-tight">Sign in</h2>
                  <p className="text-sm text-muted-foreground">Sign in is not configured.</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!authState.isAdmin) {
    return (
      <div className="flex items-center justify-center py-6">
        <Card className="w-full max-w-md m-auto border-0">
          <CardHeader>
            <CardTitle>Access denied</CardTitle>
            <CardDescription>This page is available only for admin accounts.</CardDescription>
          </CardHeader>
          {miniAppEnv !== 'mini' ? (
            <CardContent>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  void handleSignOut();
                }}
                className="w-full"
              >
                Sign out
              </Button>
            </CardContent>
          ) : null}
        </Card>
      </div>
    );
  }

  if (mode === 'edit') {
    if (!gigPublicId) {
      return <div className="p-4 text-sm text-red-600">Missing gigPublicId</div>;
    }
    return (
      <EditGigFormClient
        countries={countries}
        gigPublicId={gigPublicId}
      />
    );
  }

  return <CreateGigFormClient countries={countries} />;
}
