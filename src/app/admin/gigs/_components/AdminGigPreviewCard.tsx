import Link from 'next/link';
import type { ReactNode } from 'react';
import { AlertTriangle, Calendar, Link2, MapPin } from 'lucide-react';
import {
  buildAdminGigFeedHref,
  formatAdminGigEventDate,
  formatAdminGigSuggestedBy,
} from '@/app/admin/gigs/admin-gig-format';
import type { AdminGigDetail } from '@/app/admin/gigs/types';
import type { GigStatus } from '@/app/admin/gigs/types';
import { cn } from '@/lib/utils';
import AdminGigPreviewActions from '@/app/admin/gigs/_components/AdminGigPreviewActions';
import AdminGigPreviewPoster from '@/app/admin/gigs/_components/AdminGigPreviewPoster';
import { buildGigFormEditPath, GIG_FORM_ADMIN_BASE_PATH } from '@/app/gig-form/gig-form-paths';

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

interface AdminGigPreviewCardProps {
  readonly gig: AdminGigDetail | null;
  readonly listFilter: GigStatus;
}

export default function AdminGigPreviewCard(props: AdminGigPreviewCardProps) {
  const { gig, listFilter } = props;

  if (!gig) {
    return (
      <div className="flex min-h-[12rem] flex-1 items-center justify-center rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
        Select a gig from the list
      </div>
    );
  }

  const editHref = buildGigFormEditPath(GIG_FORM_ADMIN_BASE_PATH, gig.publicId);
  const isPublished = gig.status === 'Published';
  const feedHref = isPublished ? buildAdminGigFeedHref(gig) : null;
  const dateLabel = formatAdminGigEventDate(gig.date, gig.endDate);

  return (
    <article className="flex max-h-[calc(100dvh-var(--header-h)-3rem)] w-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="relative space-y-2 px-3 pb-2 pt-3">
          <h2 className="pr-12 text-base font-semibold leading-snug">
            {feedHref ? (
              <Link
                href={feedHref}
                className="hover:underline underline-offset-2"
                title="Open in feed"
              >
                {gig.title}
              </Link>
            ) : (
              gig.title
            )}
          </h2>

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
              <MapPin
                className="h-4 w-4"
                aria-hidden
              />
            }
          >
            {gig.venue}
            <span className="text-muted-foreground">
              {' '}
              · {gig.city}, {gig.countryCode}
            </span>
          </MetaRow>
          {gig.ticketsUrl ? (
            <MetaRow
              icon={
                <Link2
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

          <p className="text-xs text-muted-foreground">
            {formatAdminGigSuggestedBy(gig.suggestedBy)}
          </p>

          {!gig.hasTelegramModerationPost && (
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
          )}
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
          listFilter={listFilter}
          editHref={editHref}
        />
      </div>
    </article>
  );
}
