import 'server-only';

import { apiPublicRequest } from '@/lib/api';
import {
  parseV1GigDatesGetResponseBody,
  parseV1GigGetResponseBody,
} from '@/lib/api-boundary-schemas';
import { gigDateToYMD } from '@/lib/feed/feed.mapper';
import type { V1GigDatesGetResponseBody, V1GigGetResponseBody } from '@/lib/types';

/** Aligns with `export const revalidate` on the feed page (ISR). */
const FEED_REVALIDATE_SECONDS = 60; // 60 seconds (1 minute)

const FEED_ISR_REQUEST_INIT = {
  next: {
    revalidate: FEED_REVALIDATE_SECONDS,
  },
};

export interface GetFeedParams {
  readonly limit: number;
  readonly country?: string;
  readonly city?: string;
  readonly cursor?: string;
}

export interface GetAvailableGigDatesParams {
  readonly country: string;
  readonly city: string;
}

function toSortedUniqueYmdDates(dates: V1GigDatesGetResponseBody['dates']): string[] {
  const ymd = dates.map((date) => gigDateToYMD(date));
  return Array.from(new Set(ymd)).sort();
}

/**
 * Server-side feed loader.
 * Use this for the initial page so the feed is pre-rendered.
 */
export async function getFeed(params: GetFeedParams): Promise<V1GigGetResponseBody> {
  const { limit, country, city, cursor } = params;

  const qs = new URLSearchParams();
  qs.set('limit', String(limit));
  if (cursor) qs.set('cursor', cursor);
  if (country) qs.set('country', country);
  if (city) qs.set('city', city);

  const raw = await apiPublicRequest<unknown>(
    `v1/gig?${qs.toString()}`,
    'GET',
    undefined,
    FEED_ISR_REQUEST_INIT,
  );
  return parseV1GigGetResponseBody(raw);
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

  const raw = await apiPublicRequest<unknown>(
    `v1/gig/dates?${qs.toString()}`,
    'GET',
    undefined,
    FEED_ISR_REQUEST_INIT,
  );
  const response = parseV1GigDatesGetResponseBody(raw);

  return toSortedUniqueYmdDates(response.dates);
}
