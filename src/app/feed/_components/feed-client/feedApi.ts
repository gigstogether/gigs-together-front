import { apiRequest } from '@/lib/api';
import {
  parseV1GigAroundGetResponseBody,
  parseV1GigByPublicIdGetResponseBody,
  parseV1GigDatesGetResponseBody,
  parseV1GigGetResponseBody,
} from '@/lib/api-boundary-schemas';
import { gigDateToYMD } from '@/lib/feed.mapper';
import type { V1GigAroundGetResponseBody, V1GigGetResponseBody } from '@/lib/types';

interface FeedLocationParams {
  readonly country?: string;
  readonly city?: string;
  readonly signal?: AbortSignal;
}

interface FetchFeedPageParams extends FeedLocationParams {
  readonly limit: number;
  readonly cursor?: string;
  readonly direction?: 'prev';
}

interface FetchFeedAroundParams extends FeedLocationParams {
  readonly anchorYmd: string;
  readonly beforeLimit: number;
  readonly afterLimit: number;
}

export interface FetchFeedAnchorYmdByPublicIdParams {
  readonly publicId: string;
  readonly signal?: AbortSignal;
}

function appendFeedLocationQuery(qs: URLSearchParams, params: FeedLocationParams): void {
  if (params.country) qs.set('country', params.country);
  if (params.city) qs.set('city', params.city);
}

function withQuery(path: string, qs: URLSearchParams): string {
  const query = qs.toString();
  return query ? `${path}?${query}` : path;
}

export async function fetchFeedPage(params: FetchFeedPageParams): Promise<V1GigGetResponseBody> {
  const qs = new URLSearchParams();
  qs.set('limit', String(params.limit));
  if (params.cursor) qs.set('cursor', params.cursor);
  if (params.direction) qs.set('direction', params.direction);
  appendFeedLocationQuery(qs, params);

  const raw = await apiRequest<unknown>(withQuery('v1/gig', qs), 'GET', undefined, {
    signal: params.signal,
  });
  return parseV1GigGetResponseBody(raw);
}

export async function fetchFeedAround(
  params: FetchFeedAroundParams,
): Promise<V1GigAroundGetResponseBody> {
  const qs = new URLSearchParams();
  qs.set('anchor', params.anchorYmd);
  qs.set('beforeLimit', String(params.beforeLimit));
  qs.set('afterLimit', String(params.afterLimit));
  appendFeedLocationQuery(qs, params);

  const raw = await apiRequest<unknown>(withQuery('v1/gig/around', qs), 'GET', undefined, {
    signal: params.signal,
  });
  return parseV1GigAroundGetResponseBody(raw);
}

export async function fetchFeedAnchorYmdByPublicId(
  params: FetchFeedAnchorYmdByPublicIdParams,
): Promise<string> {
  const raw = await apiRequest<unknown>(
    `v1/gig/date/${encodeURIComponent(params.publicId)}`,
    'GET',
    undefined,
    { signal: params.signal },
  );
  const res = parseV1GigByPublicIdGetResponseBody(raw);
  return gigDateToYMD(res.date);
}

export async function fetchFeedAvailableDates(params: FeedLocationParams): Promise<string[]> {
  const qs = new URLSearchParams();
  appendFeedLocationQuery(qs, params);

  const raw = await apiRequest<unknown>(withQuery('v1/gig/dates', qs), 'GET', undefined, {
    signal: params.signal,
  });
  const res = parseV1GigDatesGetResponseBody(raw);

  const ymd = res.dates.map((x) => gigDateToYMD(x));
  return Array.from(new Set(ymd)).sort();
}
