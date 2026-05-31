import type { AdminGigDetail, AdminGigQueueItem } from '@/app/admin/gigs/types';
import { buildFeedPath } from '@/lib/feed.routes';
import { formatGigDate } from '@/lib/gig-date-format';

export function formatAdminGigEventDate(ymd: string, endDateYmd?: string): string {
  const start = formatGigDate(ymd);
  if (!endDateYmd || endDateYmd === ymd) return start;
  const end = formatGigDate(endDateYmd);
  return `${start} – ${end}`;
}

export function formatAdminGigListMeta(gig: AdminGigQueueItem): string {
  return `${formatAdminGigEventDate(gig.dateYmd, gig.endDateYmd)} · ${gig.city}`;
}

export function buildAdminGigFeedHref(
  gig: Pick<AdminGigDetail, 'publicId' | 'countryCode' | 'city'>,
): string {
  const feedPath = buildFeedPath({
    country: gig.countryCode,
    city: gig.city,
  });
  return `${feedPath}#${gig.publicId}`;
}

export function formatAdminGigSubmittedBy(gig: AdminGigDetail): string {
  if (gig.submitter.telegramUsername) {
    return `${gig.submitter.displayName} (@${gig.submitter.telegramUsername})`;
  }
  return gig.submitter.displayName;
}
