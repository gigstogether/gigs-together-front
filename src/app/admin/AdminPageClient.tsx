'use client';

import SignInContent from '@/app/_components/SignInContent';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useModeratorTelegramSession } from '@/hooks/use-moderator-telegram-session';

export default function AdminPageClient() {
  const {
    authState,
    isLoadingAuthState,
    telegramBotUsername,
    isTelegramSignInAvailable,
    miniAppEnv,
    handleAuthenticated,
    handleSignOut,
  } = useModeratorTelegramSession();

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
