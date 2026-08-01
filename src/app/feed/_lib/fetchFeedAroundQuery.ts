import type { QueryFunctionContext } from '@tanstack/react-query';

import type { V1GigAroundGetResponseBody } from '@/lib/types';

import { fetchFeedAround } from './feedApi';
import type { FeedAroundKeyParams } from '@/lib/feed/feedKeys';
import { feedKeys } from '@/lib/feed/feedKeys';

/** 300_000 ms (5 minutes): around response is valid short-term; aligns with anchor-date cache. */
export const FEED_AROUND_STALE_TIME_MS = 300_000;

type FeedAroundQueryKey = ReturnType<typeof feedKeys.around>;

export interface FeedAroundQueryOptions {
  readonly queryKey: FeedAroundQueryKey;
  readonly queryFn: (
    ctx: QueryFunctionContext<FeedAroundQueryKey>,
  ) => Promise<V1GigAroundGetResponseBody>;
  readonly staleTime: number;
}

export function feedAroundQueryOptions(params: FeedAroundKeyParams): FeedAroundQueryOptions {
  return {
    queryKey: feedKeys.around(params),
    queryFn: (ctx) => {
      return fetchFeedAround({
        anchorYmd: params.anchorYmd,
        beforeLimit: params.beforeLimit,
        afterLimit: params.afterLimit,
        country: params.country,
        city: params.city,
        signal: ctx.signal,
      });
    },
    staleTime: FEED_AROUND_STALE_TIME_MS,
  };
}
