'use client';

import { Eye, EyeOff, Loader2, Megaphone, Pencil, SquareArrowOutUpRight } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';

import type { AdminGigDetail, AdminGigFormData } from '@/app/admin/gigs/_lib/types';
import { useAdminGigActions } from '@/app/admin/gigs/_hooks/use-admin-gig-actions';
import { Button } from '@/components/ui/button';

interface AdminGigPreviewActionsProps {
  readonly gig: AdminGigDetail | AdminGigFormData;
  readonly editHref: Route;
}

const actionButtonClassName = 'h-9 min-w-0 flex-1 gap-1 px-2';

export default function AdminGigPreviewActions(props: AdminGigPreviewActionsProps) {
  const { gig, editHref } = props;
  const { isPosting, isChangingVisibility, post, toggleVisibility } = useAdminGigActions({
    publicId: gig.publicId,
    expectedVersion: gig.version,
    isVisible: gig.isVisible,
  });
  const isBusy = isPosting || isChangingVisibility;

  return (
    <div className="flex gap-2 border-t p-2">
      {!gig.mainPostUrl ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={actionButtonClassName}
          disabled={isBusy}
          onClick={post}
        >
          {isPosting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Megaphone className="h-4 w-4" />
          )}
          Post
        </Button>
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={actionButtonClassName}
        disabled={isBusy}
        onClick={toggleVisibility}
      >
        {isChangingVisibility ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : gig.isVisible ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
        {gig.isVisible ? 'Hide' : 'Show'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className={actionButtonClassName}
        asChild
      >
        <Link href={editHref}>
          <Pencil className="h-4 w-4" />
          Edit
          <SquareArrowOutUpRight className="ml-auto h-3 w-3 opacity-60" />
        </Link>
      </Button>
    </div>
  );
}
