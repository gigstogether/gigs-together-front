'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Clock3,
  ExternalLink,
  Loader2,
  Pencil,
  SquareArrowOutUpRight,
  Ticket,
  X,
} from 'lucide-react';
import Link from 'next/link';

import AdminPreviewPoster from '@/app/admin/_components/AdminPreviewPoster';
import AdminPreviewMetaRow from '@/app/admin/_components/AdminPreviewMetaRow';
import { rejectAdminGigCandidate } from '@/app/admin/_lib/admin-api';
import { formatAdminEventDate } from '@/app/admin/_lib/admin-event-format';
import { adminKeys } from '@/app/admin/_lib/adminKeys';
import { GIG_CANDIDATE_STATUS_DOT_CLASS_NAMES } from '@/app/admin/gigs/candidates/_lib/admin-gig-candidate-status';
import type { AdminGigCandidate } from '@/app/admin/gigs/candidates/_lib/admin-gig-candidate';
import { GigCandidateStatusAPI } from '@/app/admin/gigs/candidates/_lib/admin-gig-candidate';
import { Button } from '@/components/ui/button';
import { LocationIcon } from '@/components/ui/location-icon';
import { toast } from '@/hooks/use-toast';
import { ApiError } from '@/lib/api-errors';
import { buildAdminGigPublicIdRoute } from '@/lib/admin-gig-paths';
import {
  buildAdminGigCandidateEditRoute,
  buildAdminGigCandidatePath,
} from '@/lib/admin-gig-candidate-paths';
import { cn } from '@/lib/utils';
import { ShareButton } from '@/components/ShareButton';

interface AdminGigCandidateCardProps {
  gigCandidate: AdminGigCandidate;
  isRejectActionVisible?: boolean;
}

export default function AdminGigCandidateCard(props: AdminGigCandidateCardProps) {
  const { gigCandidate, isRejectActionVisible = true } = props;
  const queryClient = useQueryClient();
  const { gigDraft } = gigCandidate;
  const title = gigDraft.title ?? 'Untitled Gig Candidate';
  const location = [gigDraft.venue, gigDraft.city, gigDraft.country].filter(Boolean).join(', ');
  const editRoute = buildAdminGigCandidateEditRoute(gigCandidate.id);
  const isEditable = gigCandidate.status === GigCandidateStatusAPI.Reviewing;
  const isRejectable = gigCandidate.status === GigCandidateStatusAPI.Pending || isEditable;
  const hasRejectAction = isRejectable && isRejectActionVisible;
  const hasActions = isEditable || hasRejectAction;
  const sourceLabel =
    gigCandidate.source.type === 'user'
      ? `User source · ${gigCandidate.source.origin.type} · ${gigCandidate.source.userId}`
      : `Provider source · ${gigCandidate.source.provider.name} · ${gigCandidate.source.provider.externalEventId}`;
  const rejectMutation = useMutation({
    mutationFn: () =>
      rejectAdminGigCandidate({
        gigCandidateId: gigCandidate.id,
        expectedVersion: gigCandidate.version,
      }),
    onSuccess: async (rejectedGigCandidate) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminKeys.gigCandidatesRoot() }),
        queryClient.invalidateQueries({
          queryKey: adminKeys.gigCandidateById(rejectedGigCandidate.id),
        }),
      ]);
      toast({ title: 'Gig Candidate rejected' });
    },
    onError: async (error) => {
      if (error instanceof ApiError && error.statusCode === 409) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: adminKeys.gigCandidatesRoot() }),
          queryClient.invalidateQueries({
            queryKey: adminKeys.gigCandidateById(gigCandidate.id),
          }),
        ]);
        toast({
          title: 'Gig Candidate changed elsewhere',
          description: 'The latest version is being reloaded.',
          variant: 'destructive',
        });
        return;
      }
      toast({ title: 'Could not reject Gig Candidate', variant: 'destructive' });
    },
  });

  return (
    <article className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-2 px-3 pb-2 pt-3">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="flex min-w-0 flex-1 items-center gap-2 text-base font-semibold leading-snug">
              <span
                className={cn(
                  'inline-block h-1.5 w-1.5 shrink-0 rounded-full',
                  GIG_CANDIDATE_STATUS_DOT_CLASS_NAMES[gigCandidate.status],
                )}
                title={gigCandidate.status}
                aria-label={gigCandidate.status}
              />
              <span className="min-w-0 truncate">{title}</span>
            </h2>
            <ShareButton sharePath={buildAdminGigCandidatePath(gigCandidate.id)} />
          </div>

          {gigDraft.date ? (
            <AdminPreviewMetaRow
              icon={
                <Calendar
                  className="h-4 w-4"
                  aria-hidden
                />
              }
            >
              {formatAdminEventDate(gigDraft.date, gigDraft.endDate)}
            </AdminPreviewMetaRow>
          ) : null}
          {location ? (
            <AdminPreviewMetaRow
              icon={
                <LocationIcon
                  className="h-4 w-4"
                  aria-hidden
                />
              }
            >
              {location}
            </AdminPreviewMetaRow>
          ) : null}
          {gigDraft.ticketsUrl ? (
            <AdminPreviewMetaRow
              icon={
                <Ticket
                  className="h-4 w-4"
                  aria-hidden
                />
              }
            >
              <a
                href={gigDraft.ticketsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 truncate text-primary underline-offset-4 hover:underline"
              >
                {gigDraft.ticketsUrl}
              </a>
            </AdminPreviewMetaRow>
          ) : null}

          <div className="space-y-2 border-t border-border pt-2 text-xs text-muted-foreground">
            <p>{sourceLabel}</p>
            <AdminPreviewMetaRow
              className="text-xs"
              icon={
                <Clock3
                  className="h-3.5 w-3.5"
                  aria-hidden
                />
              }
            >
              Created {new Date(gigCandidate.createdAt).toLocaleString()}
            </AdminPreviewMetaRow>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {gigCandidate.postUrl ? (
                <a
                  href={gigCandidate.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                >
                  <ExternalLink
                    className="h-3.5 w-3.5"
                    aria-hidden
                  />
                  Gig Candidate post
                </a>
              ) : null}
              {gigCandidate.linkedGigPublicId ? (
                <Link
                  href={buildAdminGigPublicIdRoute(gigCandidate.linkedGigPublicId)}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Open linked gig
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <div className="p-2 pt-0">
          <AdminPreviewPoster
            posterUrl={gigDraft.posterUrl}
            title={title}
          />
        </div>
      </div>

      {hasActions ? (
        <div className="flex shrink-0 gap-2 border-t bg-card p-2">
          {isEditable ? (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-9 min-w-0 flex-1 gap-1 px-2"
            >
              <Link href={editRoute}>
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
              className="h-9 min-w-0 flex-1 gap-1 px-2 text-destructive"
              disabled={rejectMutation.isPending}
              onClick={() => rejectMutation.mutate()}
            >
              {rejectMutation.isPending ? (
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
      ) : null}
    </article>
  );
}
