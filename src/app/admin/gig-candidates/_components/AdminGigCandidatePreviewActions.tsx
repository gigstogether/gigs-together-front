'use client';

import { Check, Loader2, Pencil, Send, SquareArrowOutUpRight, X } from 'lucide-react';
import Link from 'next/link';

import { useAdminGigCandidateActions } from '@/app/admin/gig-candidates/_hooks/use-admin-gig-candidate-actions';
import type { AdminGigCandidate } from '@/app/admin/gig-candidates/_lib/admin-gig-candidate';
import { GigCandidateStatusAPI } from '@/app/admin/gig-candidates/_lib/admin-gig-candidate';
import { Button } from '@/components/ui/button';
import { buildAdminGigCandidateEditRoute } from '@/lib/admin-gig-candidate-paths';
import { cn } from '@/lib/utils';

interface AdminGigCandidatePreviewActionsProps {
  gigCandidate: AdminGigCandidate;
}

const actionButtonClassName = 'h-9 min-w-0 flex-1 gap-1 px-2';

export default function AdminGigCandidatePreviewActions(
  props: AdminGigCandidatePreviewActionsProps,
) {
  const { gigCandidate } = props;

  const isNew = gigCandidate.status === GigCandidateStatusAPI.New;
  const isReviewing = gigCandidate.status === GigCandidateStatusAPI.Reviewing;
  const hasRejectAction = isNew || isReviewing;
  const {
    approveGigCandidate,
    isApproving,
    isRejecting,
    isSendingToModeration,
    rejectGigCandidate,
    sendGigCandidateToModeration,
  } = useAdminGigCandidateActions({
    gigCandidateId: gigCandidate.id,
    expectedVersion: gigCandidate.version,
  });
  const isMutating = isApproving || isRejecting || isSendingToModeration;

  if (!isNew && !isReviewing) {
    return null;
  }

  return (
    <div className="flex shrink-0 gap-2 border-t bg-card p-2">
      {isNew ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={actionButtonClassName}
          disabled={isMutating}
          onClick={sendGigCandidateToModeration}
        >
          {isSendingToModeration ? (
            <Loader2
              className="h-4 w-4 animate-spin"
              aria-hidden
            />
          ) : (
            <Send
              className="h-4 w-4 shrink-0"
              aria-hidden
            />
          )}
          Send to moderation
        </Button>
      ) : null}
      {isReviewing ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={actionButtonClassName}
          disabled={isMutating}
          onClick={approveGigCandidate}
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
      ) : null}
      {isReviewing ? (
        <Button
          asChild
          variant="outline"
          size="sm"
          className={actionButtonClassName}
        >
          <Link href={buildAdminGigCandidateEditRoute(gigCandidate.id)}>
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
      ) : null}
      {hasRejectAction ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(actionButtonClassName, 'text-destructive')}
          disabled={isMutating}
          onClick={rejectGigCandidate}
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
      ) : null}
    </div>
  );
}
