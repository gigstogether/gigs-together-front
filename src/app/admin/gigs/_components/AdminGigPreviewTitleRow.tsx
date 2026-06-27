'use client';

import { getGigStatusFromAdminGigStatusAPI } from '@/app/admin/gigs/admin-gigs-filter';
import type { GigStatusAPI } from '@/app/admin/gigs/types';
import { ShareMenu } from '@/components/ShareMenu';
import { cn } from '@/lib/utils';

interface AdminGigPreviewTitleRowProps {
  readonly title: string;
  readonly sharePath: string;
  readonly status: GigStatusAPI;
}

const GIG_STATUS_DOT_CLASS_NAMES = {
  pending: 'bg-yellow-500',
  approved: 'bg-emerald-500',
  rejected: 'bg-rose-500',
} as const;

export default function AdminGigPreviewTitleRow(props: AdminGigPreviewTitleRowProps) {
  const { title, sharePath, status } = props;

  const normalizedStatus = getGigStatusFromAdminGigStatusAPI(status);

  return (
    <div className="flex min-w-0 items-center gap-2">
      <h2 className="flex min-w-0 flex-1 items-center gap-2 text-base font-semibold leading-snug">
        <span
          className={cn(
            'inline-block h-1.5 w-1.5 shrink-0 self-center rounded-full',
            GIG_STATUS_DOT_CLASS_NAMES[normalizedStatus],
          )}
          title={status}
          aria-label={status}
        />
        <span className="min-w-0 truncate">{title}</span>
      </h2>
      <ShareMenu sharePath={sharePath} />
    </div>
  );
}
