import type { QueryFunctionContext } from '@tanstack/react-query';

import { fetchFeedAnchorYmdByPublicId } from './feedApi';
import { feedKeys } from './feedKeys';

/** 300_000 ms (5 minutes): gig date for a stable public id changes rarely during a session. */
export const FEED_ANCHOR_DATE_BY_PUBLIC_ID_STALE_TIME_MS = 300_000;

type FeedAnchorDateByPublicIdQueryKey = ReturnType<typeof feedKeys.anchorDateByPublicId>;

export interface FeedAnchorDateByPublicIdQueryOptions {
  readonly queryKey: FeedAnchorDateByPublicIdQueryKey;
  readonly queryFn: (
    ctx: QueryFunctionContext<FeedAnchorDateByPublicIdQueryKey>,
  ) => Promise<string>;
  readonly staleTime: number;
}

export function feedAnchorDateByPublicIdQueryOptions(
  publicId: string,
): FeedAnchorDateByPublicIdQueryOptions {
  return {
    queryKey: feedKeys.anchorDateByPublicId(publicId),
    queryFn: (ctx) => {
      return fetchFeedAnchorYmdByPublicId({ publicId, signal: ctx.signal });
    },
    staleTime: FEED_ANCHOR_DATE_BY_PUBLIC_ID_STALE_TIME_MS,
  };
}
