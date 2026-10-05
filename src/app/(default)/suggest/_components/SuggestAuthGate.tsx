'use client';

import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/hooks/use-telegram-auth';

interface SuggestAuthGateProps {
  children: ReactNode;
}

export default function SuggestAuthGate(props: SuggestAuthGateProps) {
  const { children } = props;

  const { authState, isLoadingAuthState, isSigningIn, isTelegramSignInAvailable, signIn } =
    useTelegramAuth();

  const handleSignIn = async (): Promise<void> => {
    try {
      await signIn();
    } catch (e) {
      toast({
        title: 'Sign in failed',
        description: e instanceof Error ? e.message : 'Could not complete Telegram sign-in.',
        variant: 'destructive',
      });
    }
  };

  if (isLoadingAuthState) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center py-6">
        <span className="text-base text-muted-foreground">Loading…</span>
      </div>
    );
  }

  if (!authState) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center py-6 px-4">
        <Card className="w-full max-w-md border-0">
          <CardHeader>
            <CardTitle>Sign in to suggest a gig</CardTitle>
            <CardDescription>
              Any signed-in user can propose a concert. We review suggestions before they go live.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {isTelegramSignInAvailable ? (
              <Button
                type="button"
                className="w-full"
                disabled={isSigningIn}
                onClick={() => {
                  void handleSignIn();
                }}
              >
                {isSigningIn ? 'Signing in…' : 'Sign in'}
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Telegram sign-in is not available in this session, so suggestions cannot be
                submitted.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
