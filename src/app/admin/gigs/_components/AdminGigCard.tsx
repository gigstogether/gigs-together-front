'use client';

import type { ReactNode } from 'react';
import { AlertTriangle, Calendar, ExternalLink, Rss, Ticket } from 'lucide-react';
import Link from 'next/link';
import { LocationIcon } from '@/components/ui/location-icon';
import {
  buildAdminGigPublicHref,
  formatAdminGigEventDate,
  formatAdminGigSuggestedBy,
} from '@/app/admin/gigs/admin-gig-format';
import { getGigStatusFromAdminGigStatusAPI } from '@/app/admin/gigs/admin-gigs-filter';
import type { AdminGigDetail, AdminGigFormData } from '@/app/admin/gigs/types';
import { GigStatus } from '@/app/admin/gigs/types';
import { cn } from '@/lib/utils';
import AdminGigPreviewActions from '@/app/admin/gigs/_components/AdminGigPreviewActions';
import AdminGigPreviewPoster from '@/app/admin/gigs/_components/AdminGigPreviewPoster';
import AdminGigPreviewTitleRow from '@/app/admin/gigs/_components/AdminGigPreviewTitleRow';
import {
  buildAdminGigEditRoute,
  buildAdminGigPublicIdPath,
} from '@/app/admin/gigs/admin-gig-paths';

interface MetaRowProps {
  readonly icon: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
}

function MetaRow(props: MetaRowProps) {
  return (
    <div className={cn('flex min-w-0 items-start gap-2 text-sm', props.className)}>
      <span className="mt-0.5 shrink-0 text-muted-foreground">{props.icon}</span>
      <span className="min-w-0 flex-1 leading-snug">{props.children}</span>
    </div>
  );
}

interface AdminGigCardProps {
  readonly gig: AdminGigDetail | AdminGigFormData;
}

export default function AdminGigCard(props: AdminGigCardProps) {
  const { gig } = props;
  const moderationStatus = getGigStatusFromAdminGigStatusAPI(gig.status);

  const editHref = buildAdminGigEditRoute(gig.publicId);
  const shareHref = buildAdminGigPublicIdPath(gig.publicId);
  const dateLabel = formatAdminGigEventDate(gig.date, gig.endDate);
  const feedHref = buildAdminGigPublicHref(gig);

  return (
    <article className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-2 px-3 pb-2 pt-3">
          <AdminGigPreviewTitleRow
            title={gig.title}
            sharePath={shareHref}
            status={gig.status}
          />

          <MetaRow
            icon={
              <Calendar
                className="h-4 w-4"
                aria-hidden
              />
            }
          >
            {dateLabel}
          </MetaRow>
          <MetaRow
            icon={
              <LocationIcon
                className="h-4 w-4"
                aria-hidden
              />
            }
          >
            {gig.venue}
          </MetaRow>
          {gig.ticketsUrl ? (
            <MetaRow
              icon={
                <Ticket
                  className="h-4 w-4"
                  aria-hidden
                />
              }
            >
              <a
                href={gig.ticketsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-primary underline-offset-4 hover:underline"
              >
                {gig.ticketsUrl}
              </a>
            </MetaRow>
          ) : null}

          {moderationStatus === GigStatus.Approved ? (
            <div className="border-t border-border pt-2">
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 text-sm leading-snug">
                <Link
                  href={feedHref}
                  className="inline-flex min-w-0 items-center gap-1.5 text-primary underline-offset-4 hover:underline"
                >
                  <Rss
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  Public view
                </Link>
                {gig.publishPostUrl ? (
                  <>
                    <span
                      className="text-muted-foreground"
                      aria-hidden
                    >
                      |
                    </span>
                    <a
                      href={gig.publishPostUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-w-0 items-center gap-1.5 text-primary underline-offset-4 hover:underline"
                    >
                      <ExternalLink
                        className="h-4 w-4 shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                      Post
                    </a>
                  </>
                ) : null}
              </div>
            </div>
          ) : null}

          <p className="text-xs text-muted-foreground">
            {formatAdminGigSuggestedBy(gig.suggestedBy)}
          </p>

          {gig.moderationPostDate === undefined ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-amber-500/50 bg-amber-500/10 px-2.5 py-2 text-xs text-amber-950 dark:text-amber-200"
            >
              <AlertTriangle
                className="h-4 w-4 shrink-0"
                aria-hidden
              />
              <p className="min-w-0 leading-snug">No moderation post linked.</p>
            </div>
          ) : null}
        </div>

        <div className="p-2 pt-0">
          <AdminGigPreviewPoster
            posterUrl={gig.posterUrl}
            title={gig.title}
          />
        </div>
      </div>

      <div className="shrink-0 bg-card">
        <AdminGigPreviewActions
          gig={gig}
          editHref={editHref}
        />
      </div>
    </article>
  );
}
