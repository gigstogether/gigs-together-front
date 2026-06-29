'use client';

import { ShareMenu } from '@/components/ShareMenu';
import { cn } from '@/lib/utils';
import type { GigStatus } from '@/app/admin/gigs/types';
import { GIG_STATUS_DOT_CLASS_NAMES } from '@/app/admin/gigs/admin-gig-status';

interface AdminGigPreviewTitleRowProps {
  readonly title: string;
  readonly sharePath: string;
  readonly status: GigStatus;
}

export default function AdminGigPreviewTitleRow(props: AdminGigPreviewTitleRowProps) {
  const { title, sharePath, status } = props;

  return (
    <div className="flex min-w-0 items-center gap-2">
      <h2 className="flex min-w-0 flex-1 items-center gap-2 text-base font-semibold leading-snug">
        <span
          className={cn(
            'inline-block h-1.5 w-1.5 shrink-0 self-center rounded-full',
            GIG_STATUS_DOT_CLASS_NAMES[status],
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
