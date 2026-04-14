'use client';

import { useCallback } from 'react';
import CreateGigFormClient from '@/app/gig-form/CreateGigFormClient';
import EditGigFormClient from '@/app/gig-form/EditGigFormClient';
import SignInModal from '@/app/_components/SignInModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/hooks/use-telegram-auth';
import { ApiError } from '@/lib/api-errors';
import type { Country } from '@/lib/countries.server';
import { getTelegramAuthBotUsername } from '@/lib/telegram-auth-env';
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
  const { authState, signIn, signOut } = useTelegramAuth();
  const telegramBotUsername = getTelegramAuthBotUsername();
  const isTelegramSignInAvailable = Boolean(telegramBotUsername?.trim());

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

  if (!authState) {
    return (
      <SignInModal
        isOpen={isTelegramSignInAvailable}
        onOpenChange={() => undefined}
        telegramBotUsername={telegramBotUsername}
        onAuthenticated={handleAuthenticated}
      />
    );
  }

  if (!authState.isAdmin) {
    return (
      <Card className="w-full max-w-md m-auto border-0">
        <CardHeader>
          <CardTitle>Access denied</CardTitle>
          <CardDescription>This page is available only for admin accounts.</CardDescription>
        </CardHeader>
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
      </Card>
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
