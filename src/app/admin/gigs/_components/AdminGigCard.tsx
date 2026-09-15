'use client';

import { AlertTriangle, Calendar, ExternalLink, Rss, Ticket } from 'lucide-react';
import Link from 'next/link';
import { LocationIcon } from '@/components/ui/location-icon';
import {
  buildAdminGigPublicHref,
  formatAdminGigEventDate,
  formatAdminGigSource,
} from '@/app/admin/gigs/_lib/admin-gig-format';
import type { AdminGigDetail, AdminGigFormData } from '@/app/admin/gigs/_lib/types';
import AdminGigPreviewActions from '@/app/admin/gigs/_components/AdminGigPreviewActions';
import AdminPreviewPoster from '@/app/admin/_components/AdminPreviewPoster';
import AdminPreviewMetaRow from '@/app/admin/_components/AdminPreviewMetaRow';
import AdminGigPreviewTitleRow from '@/app/admin/gigs/_components/AdminGigPreviewTitleRow';
import { buildAdminGigEditRoute, buildAdminGigPublicIdPath } from '@/lib/admin-gig-paths';

interface AdminGigCardProps {
  readonly gig: AdminGigDetail | AdminGigFormData;
}

export default function AdminGigCard(props: AdminGigCardProps) {
  const { gig } = props;

  const editHref = buildAdminGigEditRoute(gig.publicId);
  const shareHref = buildAdminGigPublicIdPath(gig.publicId);
  const dateLabel = formatAdminGigEventDate(gig.date, gig.endDate);
  const feedHref = buildAdminGigPublicHref(gig);
  const hasPublicLinks = gig.isVisible && !!(feedHref || gig.publishPostUrl);

  return (
    <article className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-2 px-3 pb-2 pt-3">
          <AdminGigPreviewTitleRow
            title={gig.title}
            sharePath={shareHref}
            isVisible={gig.isVisible}
          />

          <AdminPreviewMetaRow
            icon={
              <Calendar
                className="h-4 w-4"
                aria-hidden
              />
            }
          >
            {dateLabel}
          </AdminPreviewMetaRow>
          <AdminPreviewMetaRow
            icon={
              <LocationIcon
                className="h-4 w-4"
                aria-hidden
              />
            }
          >
            {gig.venue}
          </AdminPreviewMetaRow>
          {gig.ticketsUrl ? (
            <AdminPreviewMetaRow
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
            </AdminPreviewMetaRow>
          ) : null}

          <div className="border-t border-border pt-2 pb-1 space-y-2">
            {hasPublicLinks && (
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

                {!!gig.publishPostUrl && (
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
                )}
              </div>
            )}

            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <p>{formatAdminGigSource(gig.source)}</p>

              {!!gig.moderationPostUrl && (
                <a
                  href={gig.moderationPostUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-w-0 items-center gap-1 text-primary underline-offset-4 hover:underline"
                  title="Moderation post"
                  aria-label="Moderation post"
                >
                  <ExternalLink
                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                </a>
              )}
            </div>
          </div>

          {gig.moderationPostUrl === undefined ? (
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
          <AdminPreviewPoster
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
