import 'server-only';

import { apiPublicRequest } from '@/lib/api';
import { parseV1GigDatesGetResponseBody } from '@/lib/api-boundary-schemas';
import { FEED_REVALIDATE_SECONDS } from '@/app/feed/_lib/feed-isr.constants';
import { gigDateToYMD } from '@/lib/feed/feed.mapper';

export interface GetAvailableGigDatesParams {
  readonly country: string;
  readonly city: string;
}

/**
 * Server-side loader for gig dates in a location (header calendar).
 * Use in the feed layout so the calendar opens without a client fetch.
 */
export async function getAvailableGigDates(params: GetAvailableGigDatesParams): Promise<string[]> {
  const { country, city } = params;

  const qs = new URLSearchParams();
  qs.set('country', country);
  qs.set('city', city);

  const raw = await apiPublicRequest<unknown>(`v1/gig/dates?${qs.toString()}`, 'GET', undefined, {
    next: {
      revalidate: FEED_REVALIDATE_SECONDS,
    },
  });
  const res = parseV1GigDatesGetResponseBody(raw);

  const ymd = res.dates.map((x) => gigDateToYMD(x));
  return Array.from(new Set(ymd)).sort();
}
