import 'server-only';

import { apiPublicRequest } from '@/lib/api';
import { parseV1GigGetResponseBody } from '@/lib/api-boundary-schemas';
import type { V1GigGetResponseBody } from '@/lib/types';

export type GetFeedParams = Readonly<{
  limit: number;
  country?: string;
  city?: string;
  cursor?: string;
}>;

/** Aligns with `export const revalidate` on the feed page (ISR). */
const FEED_REVALIDATE_SECONDS = 60; // 60 seconds (1 minute)

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

  const raw = await apiPublicRequest<unknown>(`v1/gig?${qs.toString()}`, 'GET', undefined, {
    next: {
      revalidate: FEED_REVALIDATE_SECONDS,
    },
  });
  return parseV1GigGetResponseBody(raw);
}
