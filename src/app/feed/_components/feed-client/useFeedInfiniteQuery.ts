import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

import type { InfiniteData } from '@tanstack/react-query';
import type { Event, V1GigGetResponseBodyGig } from '@/lib/types';

import { clientEnv } from '@/env/client-env';
import { gigToEvent } from '@/lib/feed.mapper';
import { mergeUniqueSorted } from './feedEvents';
import { fetchFeedPage } from './feedApi';
import { feedKeys } from './feedKeys';

export type ResolveCountryName = (iso: string) => string;

export interface UseFeedInfiniteQueryParams {
  readonly country: string;
  readonly city: string;
  readonly initialEvents?: readonly Event[];
  readonly initialPrevCursor?: string;
  readonly initialNextCursor?: string;
  readonly resolveCountryName: ResolveCountryName;
}

export interface ReplaceFeedWindowParams {
  readonly events: readonly Event[];
  readonly prevCursor?: string;
  readonly nextCursor?: string;
}

export interface UseFeedInfiniteQueryResult {
  readonly events: Event[];
  readonly hasMore: boolean;
  readonly hasPrev: boolean;
  readonly isInitialLoading: boolean;
  readonly isLoadingNext: boolean;
  readonly isLoadingPrev: boolean;
  readonly error: string | null;
  readonly fetchNextPage: () => Promise<void>;
  readonly fetchPrevPage: () => Promise<void>;
  readonly replaceWithWindow: (params: ReplaceFeedWindowParams) => void;
}

type FeedPageDirection = 'initial' | 'next' | 'prev';

interface FeedPageParam {
  readonly cursor?: string;
  readonly direction: FeedPageDirection;
}

interface FeedEventsPage {
  readonly events: readonly Event[];
  readonly prevCursor?: string;
  readonly nextCursor?: string;
  readonly requestedCursor?: string;
}

interface CreateInitialInfiniteDataParams {
  readonly initialEvents: readonly Event[];
  readonly initialPrevCursor?: string;
  readonly initialNextCursor?: string;
}

const INITIAL_FEED_PAGE_PARAM = { direction: 'initial' } satisfies FeedPageParam;

function mapGigsToEvents(
  gigs: readonly V1GigGetResponseBodyGig[],
  resolveCountryName: ResolveCountryName,
): Event[] {
  return gigs.map((gig) => gigToEvent(gig, { resolveCountryName }));
}

function createInitialInfiniteData(
  params: CreateInitialInfiniteDataParams,
): InfiniteData<FeedEventsPage, FeedPageParam> {
  return {
    pages: [
      {
        events: [...params.initialEvents],
        prevCursor: params.initialPrevCursor,
        nextCursor: params.initialNextCursor,
      },
    ],
    pageParams: [INITIAL_FEED_PAGE_PARAM],
  };
}

export function useFeedInfiniteQuery(
  params: UseFeedInfiniteQueryParams,
): UseFeedInfiniteQueryResult {
  const queryClient = useQueryClient();
  const resolveCountryNameRef = useRef(params.resolveCountryName);
  const appliedInitialSnapshotRef = useRef<string | null>(null);

  useEffect(() => {
    resolveCountryNameRef.current = params.resolveCountryName;
  }, [params.resolveCountryName]);

  const queryKey = useMemo(
    () => feedKeys.events({ country: params.country, city: params.city }),
    [params.city, params.country],
  );

  const query = useInfiniteQuery({
    queryKey,
    initialPageParam: INITIAL_FEED_PAGE_PARAM,
    initialData: params.initialEvents
      ? createInitialInfiniteData({
          initialEvents: params.initialEvents,
          initialPrevCursor: params.initialPrevCursor,
          initialNextCursor: params.initialNextCursor,
        })
      : undefined,
    refetchOnMount: false,
    queryFn: async ({ pageParam, signal }) => {
      const result = await fetchFeedPage({
        limit: clientEnv.feedPageSize,
        cursor: pageParam.cursor,
        direction: pageParam.direction === 'prev' ? 'prev' : undefined,
        country: params.country,
        city: params.city,
        signal,
      });

      return {
        events: mapGigsToEvents(result.gigs, resolveCountryNameRef.current),
        prevCursor: result.prevCursor,
        nextCursor: result.nextCursor,
        requestedCursor: pageParam.cursor,
      } satisfies FeedEventsPage;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.nextCursor || lastPage.nextCursor === lastPage.requestedCursor) {
        return undefined;
      }

      return {
        cursor: lastPage.nextCursor,
        direction: 'next',
      } satisfies FeedPageParam;
    },
    getPreviousPageParam: (firstPage) => {
      if (!firstPage.prevCursor || firstPage.prevCursor === firstPage.requestedCursor) {
        return undefined;
      }

      return {
        cursor: firstPage.prevCursor,
        direction: 'prev',
      } satisfies FeedPageParam;
    },
  });

  useEffect(() => {
    if (params.initialEvents === undefined) {
      appliedInitialSnapshotRef.current = null;
      return;
    }

    const firstId = params.initialEvents[0]?.id ?? '';
    const lastId = params.initialEvents[params.initialEvents.length - 1]?.id ?? '';
    const snapshot = [
      params.country,
      params.city,
      params.initialPrevCursor ?? '',
      params.initialNextCursor ?? '',
      String(params.initialEvents.length),
      firstId,
      lastId,
    ].join('|');

    if (appliedInitialSnapshotRef.current === snapshot) {
      return;
    }
    appliedInitialSnapshotRef.current = snapshot;

    queryClient.setQueryData<InfiniteData<FeedEventsPage, FeedPageParam>>(
      queryKey,
      createInitialInfiniteData({
        initialEvents: params.initialEvents,
        initialPrevCursor: params.initialPrevCursor,
        initialNextCursor: params.initialNextCursor,
      }),
    );
  }, [
    params.city,
    params.country,
    params.initialEvents,
    params.initialNextCursor,
    params.initialPrevCursor,
    queryClient,
    queryKey,
  ]);

  const events = useMemo(() => {
    const pages = query.data?.pages ?? [];
    return pages.reduce<Event[]>((acc, page) => mergeUniqueSorted(acc, page.events), []);
  }, [query.data]);

  const replaceWithWindow = useCallback(
    (replaceParams: ReplaceFeedWindowParams): void => {
      queryClient.setQueryData<InfiniteData<FeedEventsPage, FeedPageParam>>(queryKey, {
        pages: [
          {
            events: [...replaceParams.events],
            prevCursor: replaceParams.prevCursor,
            nextCursor: replaceParams.nextCursor,
          },
        ],
        pageParams: [INITIAL_FEED_PAGE_PARAM],
      });
    },
    [queryClient, queryKey],
  );

  const fetchNextPage = useCallback(async (): Promise<void> => {
    await query.fetchNextPage({ cancelRefetch: false });
  }, [query]);

  const fetchPrevPage = useCallback(async (): Promise<void> => {
    await query.fetchPreviousPage({ cancelRefetch: false });
  }, [query]);

  return {
    events,
    hasMore: Boolean(query.hasNextPage),
    hasPrev: Boolean(query.hasPreviousPage),
    isInitialLoading: query.isPending && !query.data,
    isLoadingNext: query.isFetchingNextPage,
    isLoadingPrev: query.isFetchingPreviousPage,
    error: query.error?.message ?? null,
    fetchNextPage,
    fetchPrevPage,
    replaceWithWindow,
  };
}
