'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useTelegramAuth } from '@/hooks/use-telegram-auth';
import { getTelegramStartParam } from '@/lib/telegram-webapp';
import { resolveSuggestLaunchPath } from '@/app/suggest/suggest-launch';

export default function SuggestLaunchClient() {
  const router = useRouter();
  const { authState, isLoadingAuthState } = useTelegramAuth();

  useEffect(() => {
    if (isLoadingAuthState) {
      return;
    }

    const startParam = getTelegramStartParam().trim() || undefined;
    const nextPath = resolveSuggestLaunchPath(authState?.isAdmin === true, startParam);
    router.replace(nextPath);
  }, [authState?.isAdmin, isLoadingAuthState, router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center py-6">
      <span className="text-base text-muted-foreground">Loading...</span>
    </div>
  );
}
