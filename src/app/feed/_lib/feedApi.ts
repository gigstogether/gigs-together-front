import { apiPublicRequest } from '@/lib/api-public';
import type { ApiPublicRequestInit } from '@/lib/api-public';
import {
  parseV1GigAroundGetResponseBody,
  parseV1GigByPublicIdGetResponseBody,
  parseV1GigDatesGetResponseBody,
  parseV1GigGetResponseBody,
} from '@/lib/api-boundary-schemas';
import { gigDateToYMD } from '@/lib/feed/feed.mapper';
import type {
  V1GigAroundGetResponseBody,
  V1GigDatesGetResponseBody,
  V1GigGetResponseBody,
} from '@/lib/types';

interface FeedLocationParams {
  readonly country?: string;
  readonly city?: string;
  readonly signal?: AbortSignal;
  readonly requestInit?: ApiPublicRequestInit;
}

export interface FetchFeedPageParams extends FeedLocationParams {
  readonly limit: number;
  readonly cursor?: string;
  readonly direction?: 'prev';
}

export interface FetchFeedAroundParams extends FeedLocationParams {
  readonly anchorYmd: string;
  readonly beforeLimit: number;
  readonly afterLimit: number;
}

export interface FetchFeedAvailableDatesParams extends FeedLocationParams {
  readonly country: string;
  readonly city: string;
}

export interface FetchFeedAnchorYmdByPublicIdParams {
  readonly publicId: string;
  readonly signal?: AbortSignal;
  readonly requestInit?: ApiPublicRequestInit;
}

interface BuildApiPublicRequestInitParams {
  readonly signal?: AbortSignal;
  readonly requestInit?: ApiPublicRequestInit;
}

function appendFeedLocationQuery(qs: URLSearchParams, params: FeedLocationParams): void {
  if (params.country) qs.set('country', params.country);
  if (params.city) qs.set('city', params.city);
}

function withQuery(path: string, qs: URLSearchParams): string {
  const query = qs.toString();
  return query ? `${path}?${query}` : path;
}

function buildApiPublicRequestInit(
  params: BuildApiPublicRequestInitParams,
): ApiPublicRequestInit | undefined {
  const { signal, requestInit } = params;

  if (signal === undefined) {
    return requestInit;
  }

  return {
    ...requestInit,
    signal,
  };
}

export async function fetchFeedPage(params: FetchFeedPageParams): Promise<V1GigGetResponseBody> {
  const qs = new URLSearchParams();
  qs.set('limit', String(params.limit));
  if (params.cursor) qs.set('cursor', params.cursor);
  if (params.direction) qs.set('direction', params.direction);
  appendFeedLocationQuery(qs, params);

  const raw = await apiPublicRequest<unknown>(
    withQuery('v1/gigs', qs),
    'GET',
    undefined,
    buildApiPublicRequestInit(params),
  );
  return parseV1GigGetResponseBody(raw);
}

export async function fetchFeedAvailableDates(
  params: FetchFeedAvailableDatesParams,
): Promise<V1GigDatesGetResponseBody> {
  const qs = new URLSearchParams();
  qs.set('country', params.country);
  qs.set('city', params.city);

  const raw = await apiPublicRequest<unknown>(
    withQuery('v1/gigs/dates', qs),
    'GET',
    undefined,
    buildApiPublicRequestInit(params),
  );
  return parseV1GigDatesGetResponseBody(raw);
}

export async function fetchFeedAround(
  params: FetchFeedAroundParams,
): Promise<V1GigAroundGetResponseBody> {
  const qs = new URLSearchParams();
  qs.set('anchor', params.anchorYmd);
  qs.set('beforeLimit', String(params.beforeLimit));
  qs.set('afterLimit', String(params.afterLimit));
  appendFeedLocationQuery(qs, params);

  const raw = await apiPublicRequest<unknown>(
    withQuery('v1/gigs/around', qs),
    'GET',
    undefined,
    buildApiPublicRequestInit(params),
  );
  return parseV1GigAroundGetResponseBody(raw);
}

export async function fetchFeedAnchorYmdByPublicId(
  params: FetchFeedAnchorYmdByPublicIdParams,
): Promise<string> {
  const raw = await apiPublicRequest<unknown>(
    `v1/gigs/date/${encodeURIComponent(params.publicId)}`,
    'GET',
    undefined,
    buildApiPublicRequestInit(params),
  );
  const res = parseV1GigByPublicIdGetResponseBody(raw);
  return gigDateToYMD(res.date);
}
