import type { Route } from 'next';

import { formatAdminEventDate, formatAdminSuggestedBy } from '@/app/admin/_lib/admin-event-format';
import type {
  AdminGigDetail,
  AdminGigQueueItem,
  AdminGigSuggestedBy,
} from '@/app/admin/gigs/_lib/types';

export function formatAdminGigEventDate(date: string, endDate?: string): string {
  return formatAdminEventDate(date, endDate);
}

export function formatAdminGigListMeta(gig: AdminGigQueueItem): string {
  return formatAdminEventDate(gig.date, gig.endDate);
}

export function buildAdminGigPublicHref(gig: Pick<AdminGigDetail, 'publicId'>): Route {
  // Next Route does not accept encoded dynamic route strings without a localized assertion.
  return `/gigs/${encodeURIComponent(gig.publicId)}` as Route;
}

export function formatAdminGigSuggestedBy(suggestedBy: AdminGigSuggestedBy): string {
  return formatAdminSuggestedBy(suggestedBy);
}
