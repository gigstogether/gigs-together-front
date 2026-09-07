import type { Route } from 'next';

import { formatAdminEventDate } from '@/app/admin/_lib/admin-event-format';
import type {
  AdminGigDetail,
  AdminGigQueueItem,
  GigSourceForAdminView,
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

export function formatAdminGigSource(source: GigSourceForAdminView): string {
  if (source.type === 'provider') {
    return `Source: ${source.type}`;
  }

  return [
    `Source: ${source.type}`,
    source.displayName,
    source.isCurrentlyAdmin ? 'currently admin' : undefined,
    source.telegramUsername !== undefined ? `TG: @${source.telegramUsername}` : undefined,
  ]
    .filter((value): value is string => value !== undefined)
    .join(' · ');
}
