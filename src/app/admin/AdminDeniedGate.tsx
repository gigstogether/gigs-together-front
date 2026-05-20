'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useModeratorTelegramSession } from '@/hooks/use-moderator-telegram-session';

export default function AdminDeniedGate() {
  const { miniAppEnv, handleSignOut } = useModeratorTelegramSession();

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
