'use client';

import { AlertTriangle, Calendar, Clock3, ExternalLink, Ticket } from 'lucide-react';
import Link from 'next/link';

import AdminPreviewPoster from '@/app/admin/_components/AdminPreviewPoster';
import AdminPreviewMetaRow from '@/app/admin/_components/AdminPreviewMetaRow';
import { formatAdminEventDate } from '@/app/admin/_lib/admin-event-format';
import { formatAdminGigSource } from '@/app/admin/gigs/_lib/admin-gig-format';
import AdminGigCandidatePreviewActions from '@/app/admin/gig-candidates/_components/AdminGigCandidatePreviewActions';
import AdminGigCandidateOriginalMessage from '@/app/admin/gig-candidates/_components/AdminGigCandidateOriginalMessage';
import { GIG_CANDIDATE_STATUS_DOT_CLASS_NAMES } from '@/app/admin/gig-candidates/_lib/admin-gig-candidate-status';
import { GigCandidateStatusAPI } from '@/app/admin/gig-candidates/_lib/admin-gig-candidate';
import type { AdminGigCandidate } from '@/app/admin/gig-candidates/_lib/admin-gig-candidate';
import { LocationIcon } from '@/components/ui/location-icon';
import { Button } from '@/components/ui/button';
import { buildAdminGigPublicIdRoute } from '@/lib/admin-gig-paths';
import { buildAdminGigCandidatePath } from '@/lib/admin-gig-candidate-paths';
import { buildGoogleMapsSearchUrl } from '@/lib/google-maps';
import { cn } from '@/lib/utils';
import { ShareButton } from '@/components/ShareButton';

interface AdminGigCandidateCardProps {
  gigCandidate: AdminGigCandidate;
}

export default function AdminGigCandidateCard(props: AdminGigCandidateCardProps) {
  const { gigCandidate } = props;
  const { gigDraft } = gigCandidate;
  const title = gigDraft.title ?? 'Untitled Gig Candidate';
  const location = [gigDraft.venue, gigDraft.city, gigDraft.country].filter(Boolean).join(', ');
  const mapsHref = location ? buildGoogleMapsSearchUrl(location) : undefined;
  const sourceLabel = formatAdminGigSource(gigCandidate.source);
  const isIntakePostExpected = !(
    gigCandidate.source.type === 'user' && gigCandidate.source.origin.type === 'admin'
  );
  const isModerationPostExpected = gigCandidate.status !== GigCandidateStatusAPI.New;
  const isPosterVisible =
    gigCandidate.status !== GigCandidateStatusAPI.New || gigDraft.posterUrl !== undefined;

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
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="block min-w-0 truncate text-primary underline-offset-4 hover:underline"
                title="Open in Google Maps"
                aria-label="Open venue in Google Maps"
              >
                {location}
              </a>
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
                className="block min-w-0 truncate text-primary underline-offset-4 hover:underline"
              >
                {gigDraft.ticketsUrl}
              </a>
            </AdminPreviewMetaRow>
          ) : null}

          {gigCandidate.originalMessage !== undefined ? (
            <div className="border-t border-border pt-2">
              <AdminGigCandidateOriginalMessage originalMessage={gigCandidate.originalMessage} />
            </div>
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
              {gigCandidate.linkedGigPublicId ? (
                <Button
                  asChild
                  size="sm"
                  className="h-6 gap-1.5 rounded-full px-2.5 [&_svg]:size-3.5"
                >
                  <Link
                    href={buildAdminGigPublicIdRoute(gigCandidate.linkedGigPublicId)}
                    aria-label="Gig"
                    title="Gig"
                  >
                    <ExternalLink aria-hidden />
                    Gig
                  </Link>
                </Button>
              ) : null}
              {gigCandidate.intakePostUrl ? (
                <a
                  href={gigCandidate.intakePostUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                >
                  <ExternalLink
                    className="h-3.5 w-3.5"
                    aria-hidden
                  />
                  Intake post
                </a>
              ) : null}
              {gigCandidate.moderationPostUrl ? (
                <a
                  href={gigCandidate.moderationPostUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                >
                  <ExternalLink
                    className="h-3.5 w-3.5"
                    aria-hidden
                  />
                  Moderation post
                </a>
              ) : null}
            </div>
          </div>

          {isIntakePostExpected && gigCandidate.intakePostUrl === undefined ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-amber-500/50 bg-amber-500/10 px-2.5 py-2 text-xs text-amber-950 dark:text-amber-200"
            >
              <AlertTriangle
                className="h-4 w-4 shrink-0"
                aria-hidden
              />
              <p className="min-w-0 leading-snug">No intake post linked.</p>
            </div>
          ) : null}
          {isModerationPostExpected && gigCandidate.moderationPostUrl === undefined ? (
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

        {isPosterVisible ? (
          <div className="p-2 pt-0">
            <AdminPreviewPoster
              posterUrl={gigDraft.posterUrl}
              posterVersion={gigCandidate.version}
              title={title}
            />
          </div>
        ) : null}
      </div>

      <AdminGigCandidatePreviewActions gigCandidate={gigCandidate} />
    </article>
  );
}
