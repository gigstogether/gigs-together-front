import type { Route } from 'next';

import type {
  AdminGigDetail,
  AdminGigQueueItem,
  AdminGigSuggestedBy,
} from '@/app/admin/gigs/types';
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

export function buildAdminGigPublicHref(gig: Pick<AdminGigDetail, 'publicId'>): Route {
  // Next Route does not accept encoded dynamic route strings without a localized assertion.
  return `/gigs/${encodeURIComponent(gig.publicId)}` as Route;
}

export function formatAdminGigSuggestedBy(suggestedBy: AdminGigSuggestedBy): string {
  const { name, username, userId } = suggestedBy;

  const PREFIX = 'Suggested by';
  const formattedUsername = username ? `@${username}` : undefined;

  if (username && name) {
    return `${PREFIX} ${formattedUsername} (${name})`;
  }
  return `${PREFIX} ${formattedUsername ?? name ?? userId ?? 'Unknown'}`;
}
