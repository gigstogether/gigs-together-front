'use client';

import type { ReactNode } from 'react';
import type { Route } from 'next';
import type { AdminGigDetail, AdminGigFormData } from '@/app/admin/gigs/_lib/types';
import { GigStatus } from '@/app/admin/gigs/_lib/types';
import Link from 'next/link';
import { Check, SquareArrowOutUpRight, Loader2, Megaphone, Pencil, X } from 'lucide-react';
import { mapGigStatusFromAPI } from '@/app/admin/gigs/_lib/admin-gig-status';
import { useAdminGigModerationActions } from '@/app/admin/gigs/_lib/use-admin-gig-moderation-actions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminGigPreviewActionsProps {
  readonly gig: AdminGigDetail | AdminGigFormData;
  readonly editHref: Route;
}

const actionButtonClassName = 'h-9 min-w-0 flex-1 gap-1 px-2';

interface ModerationActionRowProps {
  readonly children: ReactNode;
}

function ModerationActionRow(props: ModerationActionRowProps) {
  return <div className="flex gap-2 border-t p-2">{props.children}</div>;
}

export default function AdminGigPreviewActions(props: AdminGigPreviewActionsProps) {
  const { gig, editHref } = props;

  const status = mapGigStatusFromAPI(gig.status);
  const isPublishableStatus = status === GigStatus.Approved || status === GigStatus.Published;

  const { isApproving, isRejecting, isPosting, approve, reject, post } =
    useAdminGigModerationActions({
      publicId: gig.publicId,
    });

  const isModerating = isApproving || isRejecting || isPosting;

  const editButton = (
    <Button
      variant="outline"
      size="sm"
      className={actionButtonClassName}
      asChild
    >
      <Link href={editHref}>
        <Pencil
          className="h-4 w-4 shrink-0"
          aria-hidden
        />
        Edit
        <SquareArrowOutUpRight
          className="ml-auto h-3 w-3 opacity-60"
          aria-hidden
        />
      </Link>
    </Button>
  );

  const approveButton = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(actionButtonClassName, 'text-emerald-700 dark:text-emerald-400')}
      disabled={isModerating}
      onClick={approve}
    >
      {isApproving ? (
        <Loader2
          className="h-4 w-4 animate-spin"
          aria-hidden
        />
      ) : (
        <Check
          className="h-4 w-4 shrink-0"
          aria-hidden
        />
      )}
      Approve
    </Button>
  );

  const rejectButton = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(actionButtonClassName, 'text-destructive')}
      disabled={isModerating}
      onClick={reject}
    >
      {isRejecting ? (
        <Loader2
          className="h-4 w-4 animate-spin"
          aria-hidden
        />
      ) : (
        <X
          className="h-4 w-4 shrink-0"
          aria-hidden
        />
      )}
      Reject
    </Button>
  );

  const postButton = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={actionButtonClassName}
      disabled={isModerating}
      onClick={post}
    >
      {isPosting ? (
        <Loader2
          className="h-4 w-4 animate-spin"
          aria-hidden
        />
      ) : (
        <Megaphone
          className="h-4 w-4 shrink-0"
          aria-hidden
        />
      )}
      Post
    </Button>
  );

  if (isPublishableStatus) {
    if (gig.publishPostUrl) {
      return <ModerationActionRow>{editButton}</ModerationActionRow>;
    }

    return (
      <ModerationActionRow>
        {postButton}
        {editButton}
      </ModerationActionRow>
    );
  }

  if (status === GigStatus.Rejected) {
    return <ModerationActionRow>{editButton}</ModerationActionRow>;
  }

  return (
    <ModerationActionRow>
      {approveButton}
      {editButton}
      {rejectButton}
    </ModerationActionRow>
  );
}
