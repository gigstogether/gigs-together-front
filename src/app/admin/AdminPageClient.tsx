'use client';

import { Button } from '@/components/ui/button';
import { useModeratorTelegramSession } from '@/hooks/use-moderator-telegram-session';

export default function AdminPageClient() {
  const { miniAppEnv, handleSignOut } = useModeratorTelegramSession();

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
