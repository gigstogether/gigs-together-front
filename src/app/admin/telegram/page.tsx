'use client';

import { useEffect } from 'react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';

import { resolveAdminTelegramLaunch } from '@/app/(default)/suggest/_lib/suggest-launch';
import { toast } from '@/hooks/use-toast';
import { getTelegramStartParam } from '@/lib/telegram/telegram-webapp';

const ADMIN_ROUTE: Route<'/admin'> = '/admin';

export default function AdminTelegramPage() {
  const router = useRouter();

  useEffect(() => {
    const startParam = getTelegramStartParam().trim() || undefined;
    const resolution = resolveAdminTelegramLaunch(startParam);
    if (resolution.kind === 'resolved') {
      router.replace(resolution.route);
      return;
    }

    toast(
      resolution.reason === 'missingAction'
        ? {
            title: 'Telegram action is missing',
            description:
              'This admin Mini App link requires an admin action. Open it from a Gig or GigCandidate admin link.',
            variant: 'destructive',
          }
        : {
            title: 'Invalid Telegram action',
            description:
              'This admin Mini App link contains an unsupported or malformed action. Open it from a Gig or GigCandidate admin link.',
            variant: 'destructive',
          },
    );
    router.replace(ADMIN_ROUTE);
  }, [router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center py-6">
      <span className="text-base text-muted-foreground">Loading...</span>
    </div>
  );
}
