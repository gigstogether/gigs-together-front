'use client';

import SignInContent from '@/app/_components/SignInContent';
import CreateGigFormClient from '@/app/gig-form/CreateGigFormClient';
import EditGigFormClient from '@/app/gig-form/EditGigFormClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useModeratorTelegramSession } from '@/hooks/use-moderator-telegram-session';
import type { Country } from '@/lib/countries.server';

interface GigFormClientProps {
  countries: Country[];
  mode?: 'create' | 'edit';
  gigPublicId?: string;
}

export default function GigFormClient(props: GigFormClientProps) {
  const { countries, mode = 'create', gigPublicId } = props;
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
