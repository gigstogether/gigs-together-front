import type { ReactNode } from 'react';
import { AlertTriangle, Calendar, Ticket } from 'lucide-react';
import {
  formatAdminGigEventDate,
  formatAdminGigSuggestedBy,
} from '@/app/admin/gigs/admin-gig-format';
import type { AdminGigDetail, AdminGigFormData } from '@/app/admin/gigs/types';
import type { GigStatus } from '@/app/admin/gigs/types';
import { cn } from '@/lib/utils';
import AdminGigPreviewActions from '@/app/admin/gigs/_components/AdminGigPreviewActions';
import AdminGigPreviewPoster from '@/app/admin/gigs/_components/AdminGigPreviewPoster';
import AdminGigPreviewTitleRow from '@/app/admin/gigs/_components/AdminGigPreviewTitleRow';
import {
  buildGigFormEditPath,
  buildGigFormPublicIdPath,
  ADMIN_GIGS_BASE_PATH,
} from '@/app/gig-form/gig-form-paths';

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
  readonly listFilter: GigStatus;
}

export default function AdminGigCard(props: AdminGigCardProps) {
  const { gig, listFilter } = props;

  const editHref = buildGigFormEditPath(ADMIN_GIGS_BASE_PATH, gig.publicId);
  const shareHref = buildGigFormPublicIdPath(ADMIN_GIGS_BASE_PATH, gig.publicId);
  const dateLabel = formatAdminGigEventDate(gig.date, gig.endDate);

  return (
    <article className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-2 px-3 pb-2 pt-3">
          <AdminGigPreviewTitleRow
            title={gig.title}
            sharePath={shareHref}
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
          listFilter={listFilter}
          editHref={editHref}
        />
      </div>
    </article>
  );
}
