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
  return formatAdminGigEventDate(gig.date, gig.endDate);
}

export function buildAdminGigFeedHref(
  gig: Pick<AdminGigDetail, 'publicId' | 'country' | 'city'>,
): string {
  const feedPath = buildFeedPath({
    country: gig.country,
    city: gig.city,
  });
  return `${feedPath}#${gig.publicId}`;
}

export function formatAdminGigSuggestedBy(suggestedBy: AdminGigSuggestedBy): string {
  const { name, username, userId } = suggestedBy;
  const PREFIX = 'Suggested by';
  const formattedUsername = username ? `@${username}` : '';
  if (username && name) {
    return `${PREFIX} ${formattedUsername} (${name})`;
  }
  return `${PREFIX} ${formattedUsername ?? name ?? userId}`;
}
