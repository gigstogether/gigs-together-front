'use client';

import CopyableTextRow from '@/components/CopyableTextRow';
import { getGigStatusFromAdminGigStatusAPI } from '@/app/admin/gigs/types';
import type { GigStatusAPI } from '@/app/admin/gigs/types';
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

  const copyText = new URL(sharePath, window.location.origin).href;

  return (
    <CopyableTextRow
      copyText={copyText}
      copyAriaLabel="Copy link"
      copyTitle="Copy link"
      copiedToast={{
        title: 'Link copied',
        description: 'Gig link copied to clipboard.',
      }}
      failedToast={{
        title: 'Could not copy link',
        description: 'Clipboard access is not available.',
      }}
    >
      <h2 className="flex items-center gap-2 text-base font-semibold leading-snug">
        <span
          className={cn(
            'inline-block h-1.5 w-1.5 shrink-0 self-center rounded-full',
            GIG_STATUS_DOT_CLASS_NAMES[normalizedStatus],
          )}
          title={status}
          aria-label={status}
        />
        <span>{title}</span>
      </h2>
    </CopyableTextRow>
  );
}
