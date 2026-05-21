'use client';

import type { ReactNode } from 'react';

import AdminNav from '@/app/admin/_components/AdminNav';
import { Button } from '@/components/ui/button';
import { useModeratorTelegramSession } from '@/hooks/use-moderator-telegram-session';

interface AdminShellProps {
  children: ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const { authState, miniAppEnv, handleSignOut } = useModeratorTelegramSession();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 lg:flex-row lg:gap-8">
      <aside className="w-full shrink-0 lg:w-56">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Admin</p>
          {authState?.displayLabel ? (
            <p className="mt-1 truncate text-sm font-medium text-foreground">
              {authState.displayLabel}
            </p>
          ) : null}
          <div className="mt-4">
            <AdminNav />
          </div>
          {miniAppEnv !== 'mini' ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4 w-full"
              onClick={() => {
                void handleSignOut();
              }}
            >
              Sign out
            </Button>
          ) : null}
        </div>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
