import 'server-only';

import { fetchFeedAvailableDates, fetchFeedPage } from './feedApi';
import { gigDatesToSortedUniqueYmd } from '@/lib/feed/feed.mapper';
import type { V1GigGetResponseBody } from '@/lib/types';

/** Aligns with `export const revalidate` on the feed page (ISR). */
const FEED_REVALIDATE_SECONDS = 60; // 60 seconds (1 minute)

const FEED_ISR_REQUEST_INIT = {
  next: {
    revalidate: FEED_REVALIDATE_SECONDS,
  },
};

interface GetFeedParams {
  readonly limit: number;
  readonly country?: string;
  readonly city?: string;
  readonly cursor?: string;
}

interface GetAvailableGigDatesParams {
  readonly country: string;
  readonly city: string;
}

/**
 * Server-side feed loader.
 * Use this for the initial page so the feed is pre-rendered.
 */
export async function getFeed(params: GetFeedParams): Promise<V1GigGetResponseBody> {
  const { limit, country, city, cursor } = params;

  return fetchFeedPage({
    limit,
    country,
    city,
    cursor,
    requestInit: FEED_ISR_REQUEST_INIT,
  });
}

/**
 * Server-side loader for gig dates in a location (header calendar).
 * Use in the feed layout so the calendar opens without a client fetch.
 */
export async function getAvailableGigDates(params: GetAvailableGigDatesParams): Promise<string[]> {
  const { country, city } = params;

  const response = await fetchFeedAvailableDates({
    country,
    city,
    requestInit: FEED_ISR_REQUEST_INIT,
  });

  return gigDatesToSortedUniqueYmd(response.dates);
}
