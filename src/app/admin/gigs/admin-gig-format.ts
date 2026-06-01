import type {
  AdminGigDetail,
  AdminGigQueueItem,
  AdminGigSuggestedBy,
} from '@/app/admin/gigs/types';
import { buildFeedPath } from '@/lib/feed.routes';
import { formatGigDate } from '@/lib/gig-date-format';

export function formatAdminGigEventDate(date: string, endDate?: string): string {
  const start = formatGigDate(date);
  if (!endDate || endDate === date) return start;
  const end = formatGigDate(endDate);
  return `${start} – ${end}`;
}

export function formatAdminGigListMeta(gig: AdminGigQueueItem): string {
  return `${formatAdminGigEventDate(gig.date, gig.endDate)} · ${gig.city}`;
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

export function formatAdminGigSuggestedBy(suggestedBy: AdminGigSuggestedBy): string {
  const { name, username, userId } = suggestedBy;
  const PREFIX = 'Suggested by';
  if (username && name) {
    return `${PREFIX} @${username} (${name})`;
  }
  return `${PREFIX} ${username ?? name ?? userId}`;
}
