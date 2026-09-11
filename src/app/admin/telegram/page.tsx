'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { resolveAdminGigLaunchPath } from '@/app/(default)/suggest/_lib/suggest-launch';
import { getTelegramStartParam } from '@/lib/telegram/telegram-webapp';

export default function AdminTelegramPage() {
  const router = useRouter();

  useEffect(() => {
    const startParam = getTelegramStartParam().trim() || undefined;
    router.replace(resolveAdminGigLaunchPath(startParam));
  }, [router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center py-6">
      <span className="text-base text-muted-foreground">Loading...</span>
    </div>
  );
}
