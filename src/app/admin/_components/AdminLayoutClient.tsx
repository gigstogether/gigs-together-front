'use client';

import type { ReactNode } from 'react';

import AdminDeniedGate from '@/app/admin/_components/AdminDeniedGate';
import AdminShell from '@/app/admin/_components/AdminShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useModeratorTelegramSession } from '@/app/admin/_hooks/use-moderator-telegram-session';

interface AdminLayoutClientProps {
  children: ReactNode;
}

export default function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const { authState, handleSignIn, isLoadingAuthState, isSigningIn, isTelegramSignInAvailable } =
    useModeratorTelegramSession();

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
              This page is only for moderators. Sign in if your account has access.
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
                Telegram sign-in is not available in this session, so this page cannot be used.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!authState.isAdmin) {
    return <AdminDeniedGate />;
  }

  return <AdminShell>{children}</AdminShell>;
}
