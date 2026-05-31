import Link from 'next/link';
import type { ReactNode } from 'react';
import { Calendar, Link2, MapPin } from 'lucide-react';
import {
  buildAdminGigFeedHref,
  formatAdminGigEventDate,
  formatAdminGigSubmittedBy,
} from '@/app/admin/gigs/admin-gig-format';
import type { AdminGigDetail } from '@/app/admin/gigs/types';
import type { GigStatus } from '@/app/admin/gigs/types';
import { cn } from '@/lib/utils';
import AdminGigPreviewActions from '@/app/admin/gigs/_components/AdminGigPreviewActions';
import AdminGigPreviewPoster from '@/app/admin/gigs/_components/AdminGigPreviewPoster';

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

  const feedHref = buildAdminGigFeedHref(gig);
  const dateLabel = formatAdminGigEventDate(gig.dateYmd, gig.endDateYmd);

  return (
    <article className="flex max-h-[calc(100dvh-var(--header-h)-3rem)] w-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="relative space-y-2 px-3 pb-2 pt-3">
          <h2 className="pr-12 text-base font-semibold leading-snug">
            <Link
              href={feedHref}
              className="hover:underline underline-offset-2"
              title="Open in feed"
            >
              {gig.title}
            </Link>
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

          <p className="text-xs text-muted-foreground">{formatAdminGigSubmittedBy(gig)}</p>
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
          editHref="#"
        />
      </div>
    </article>
  );
}
