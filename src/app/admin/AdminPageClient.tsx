'use client';

import { useCallback } from 'react';
import SignInContent from '@/app/_components/SignInContent';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTelegramMiniAppEnv } from '@/hooks/use-telegram-mini-app-env';
import { toast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/hooks/use-telegram-auth';
import { ApiError } from '@/lib/api-errors';
import type { TelegramWidgetUser } from '@/types/telegram-login';
import { clientEnv } from '@/env/client-env';

export default function AdminPageClient() {
  // TODO: extract duplicated fragment
  const { authState, isLoadingAuthState, signIn, signOut } = useTelegramAuth();
  const telegramBotUsername = clientEnv.isAuthEnabled ? clientEnv.telegramBotUsername : undefined;
  const isTelegramSignInAvailable = Boolean(telegramBotUsername?.trim());
  const miniAppEnv = useTelegramMiniAppEnv();

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
      <div className="flex min-h-[50vh] items-center justify-center py-6">
        <span className="text-base text-muted-foreground">Loading…</span>
      </div>
    );
  }

  if (!authState) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center py-6 px-4">
        <Card className="w-full max-w-md border-0">
          <CardHeader>
            <CardTitle>Restricted area</CardTitle>
            <CardDescription>
              This page is only for moderators. Sign in with Telegram if your account has access.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {isTelegramSignInAvailable ? (
              <SignInContent
                telegramBotUsername={telegramBotUsername}
                onAuthenticated={handleAuthenticated}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Sign-in is not configured on this deployment, so this page cannot be used.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!authState.isAdmin) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center py-6 px-4">
        <Card className="w-full max-w-md border-0">
          <CardHeader>
            <CardTitle>Access denied</CardTitle>
            <CardDescription>
              Your account is signed in, but it does not have moderator access. You cannot use this
              page.
            </CardDescription>
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

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-12 text-center">
      <p className="text-lg font-medium text-foreground">You are signed in to the admin area.</p>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Moderator tools will appear here as they are added.
      </p>
      {miniAppEnv !== 'mini' ? (
        <Button
          type="button"
          variant="outline"
          className="mt-8"
          onClick={() => {
            void handleSignOut();
          }}
        >
          Sign out
        </Button>
      ) : null}
    </div>
  );
}
