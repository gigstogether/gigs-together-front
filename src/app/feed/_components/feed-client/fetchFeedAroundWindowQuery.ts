import type { QueryFunctionContext } from '@tanstack/react-query';

import type { V1GigAroundGetResponseBody } from '@/lib/types';

import { fetchFeedAroundWindow } from './feedApi';
import type { FeedAroundWindowKeyParams } from './feedKeys';
import { feedKeys } from './feedKeys';

/** 60_000 ms (1 minute): around-window data is closer to main feed freshness than anchor-only lookups. */
export const FEED_AROUND_WINDOW_STALE_TIME_MS = 60_000;

type FeedAroundWindowQueryKey = ReturnType<typeof feedKeys.aroundWindow>;

export interface FeedAroundWindowQueryOptions {
  readonly queryKey: FeedAroundWindowQueryKey;
  readonly queryFn: (
    ctx: QueryFunctionContext<FeedAroundWindowQueryKey>,
  ) => Promise<V1GigAroundGetResponseBody>;
  readonly staleTime: number;
}

export function feedAroundWindowQueryOptions(
  params: FeedAroundWindowKeyParams,
): FeedAroundWindowQueryOptions {
  return {
    queryKey: feedKeys.aroundWindow(params),
    queryFn: (ctx) => {
      return fetchFeedAroundWindow({
        anchorYmd: params.anchorYmd,
        beforeLimit: params.beforeLimit,
        afterLimit: params.afterLimit,
        country: params.country,
        city: params.city,
        signal: ctx.signal,
      });
    },
    staleTime: FEED_AROUND_WINDOW_STALE_TIME_MS,
  };
}
