import type { AdminGigDetail, AdminGigFormData } from '@/app/admin/gigs/types';
import { GigStatus } from '@/app/admin/gigs/types';
import Link from 'next/link';
import { Check, ExternalLink, Link2, Pencil, Rss, X } from 'lucide-react';
import { buildAdminGigFeedHref } from '@/app/admin/gigs/admin-gig-format';
import { Button } from '@/components/ui/button';
import ActionButtonLink from '@/app/admin/gigs/_components/ActionButtonLink';

interface AdminGigPreviewActionsProps {
  readonly gig: AdminGigDetail | AdminGigFormData;
  readonly listFilter: GigStatus;
  readonly editHref: string;
}

export default function AdminGigPreviewActions(props: AdminGigPreviewActionsProps) {
  const { gig, listFilter, editHref } = props;

  const editButton = (
    <Button
      variant="outline"
      size="sm"
      className="h-9 w-full gap-1 px-2"
      asChild
    >
      <Link href={editHref}>
        <Pencil
          className="h-4 w-4 shrink-0"
          aria-hidden
        />
        Edit
        <ExternalLink
          className="ml-auto h-3 w-3 opacity-60"
          aria-hidden
        />
      </Link>
    </Button>
  );

  if (listFilter === GigStatus.Published) {
    return (
      <div className="grid grid-cols-3 gap-2 border-t p-2">
        <ActionButtonLink
          href={gig.publishPostUrl ?? ''}
          label="Post"
          icon={
            <Link2
              className="h-4 w-4 shrink-0"
              aria-hidden
            />
          }
          isDisabled={!gig.publishPostUrl}
        />
        <ActionButtonLink
          href={buildAdminGigFeedHref(gig)}
          label="Feed"
          icon={
            <Rss
              className="h-4 w-4 shrink-0"
              aria-hidden
            />
          }
        />
        {editButton}
      </div>
    );
  }

  if (listFilter === GigStatus.Rejected) {
    return (
      <div className="grid grid-cols-2 gap-2 border-t p-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 gap-1 px-2"
          disabled
          title="Approve is not available yet"
        >
          <Check
            className="h-4 w-4 text-emerald-600"
            aria-hidden
          />
          Approve
        </Button>
        {editButton}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 border-t p-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 gap-1 px-2"
      >
        <Check
          className="h-4 w-4 text-emerald-600"
          aria-hidden
        />
        Approve
      </Button>
      {editButton}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 gap-1 px-2"
      >
        <X
          className="h-4 w-4 text-destructive"
          aria-hidden
        />
        Reject
      </Button>
    </div>
  );
}
