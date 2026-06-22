'use client';

import type { ReactNode } from 'react';

import AdminDeniedGate from '@/app/admin/AdminDeniedGate';
import AdminShell from '@/app/admin/_components/AdminShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useModeratorTelegramSession } from '@/hooks/use-moderator-telegram-session';
import { requestTelegramSignIn } from '@/lib/telegram-auth';

interface AdminLayoutClientProps {
  children: ReactNode;
}

export default function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const { authState, isLoadingAuthState, isTelegramSignInAvailable } =
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
                onClick={() => requestTelegramSignIn()}
              >
                Sign in
              </Button>
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
    return <AdminDeniedGate />;
  }

  return <AdminShell>{children}</AdminShell>;
}
