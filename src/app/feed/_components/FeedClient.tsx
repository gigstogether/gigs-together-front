'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useReducer, useRef, useState } from 'react';
import { toLocalYMD } from '@/lib/utils';
import type { Event } from '@/lib/types';
import type { ResolveCityName, ResolveCountryName } from './feed-client/useFeedInfiniteQuery';

import { useHeaderConfig } from '@/app/_components/HeaderConfigProvider';
import { clientEnv } from '@/env/client-env';
import { countryIsoToTranslationKey } from '@/lib/country-iso-to-translation-key';
import { gigToEvent } from '@/lib/feed.mapper';
import { useT } from '@/lib/i18n';
import { FeedMonths } from './feed-client/FeedMonths';
import { useClearFeedLocationHash } from './feed-client/useClearFeedLocationHash';
import { useFeedHeaderConfigSync } from './feed-client/useFeedHeaderConfigSync';
import { useHeaderHeight } from './feed-client/useHeaderHeight';
import { useHashAutoScroll } from './feed-client/useHashAutoScroll';
import { useInfiniteScroll } from './feed-client/useInfiniteScroll';
import { useVisibleEventDateOnScroll } from './feed-client/useVisibleEventDateOnScroll';
import { feedLoadingReducer } from './feed-client/feedLoading';
import { mergeUniqueSorted } from './feed-client/feedEvents';
import { usePrependScrollRestore } from './feed-client/usePrependScrollRestore';
import { useEventHashLoader } from './feed-client/useEventHashLoader';
import { feedAroundQueryOptions } from './feed-client/fetchFeedAroundQuery';
import { feedAnchorDateByPublicIdQueryOptions } from './feed-client/fetchFeedAnchorDateQuery';
import { useFeedInfiniteQuery } from './feed-client/useFeedInfiniteQuery';

const feedMainClassName =
  'mx-auto flex w-full flex-col gap-2.5 overflow-auto pb-5 max-[600px]:items-center';

interface FeedClientProps {
  readonly country: string; // ISO like "es"
  readonly city: string; // slug like "barcelona"
  readonly initialEvents?: Event[];
  readonly initialPrevCursor?: string;
  readonly initialNextCursor?: string;
}

export default function FeedClient(props: FeedClientProps) {
  const { country, city, initialEvents, initialPrevCursor, initialNextCursor } = props;

  const clearHashFromUrl = useClearFeedLocationHash();
  const t = useT();
  const { setConfig: setHeaderConfig } = useHeaderConfig();
  const headerH = useHeaderHeight(); // will pick [data-app-header], fallback 45
  const resolveCountryName = useCallback<ResolveCountryName>(
    (iso) => t('country', countryIsoToTranslationKey(iso)),
    [t],
  );
  const resolveCityName = useCallback<ResolveCityName>((code) => t('city', code), [t]);
  const queryClient = useQueryClient();

  const feedQuery = useFeedInfiniteQuery({
    country,
    city,
    initialEvents,
    initialPrevCursor,
    initialNextCursor,
    resolveCountryName,
    resolveCityName,
  });
  const {
    events,
    hasMore,
    hasPrev,
    isInitialLoading,
    isLoadingNext,
    isLoadingPrev,
    error: feedError,
    fetchNextPage: fetchNextFeedPage,
    fetchPrevPage: fetchPrevFeedPage,
    replaceWithWindow,
  } = feedQuery;
  const [error, setError] = useState<string | null>(null);
  const [loading, dispatchLoading] = useReducer(feedLoadingReducer, {
    initial: false,
    next: false,
    prev: false,
    jump: false,
  });
  const [infiniteScrollResetKey, setInfiniteScrollResetKey] = useState(0);

  const eventRefs = useRef<Map<string, HTMLElement>>(new Map());
  const inFlightJumpRef = useRef(false);
  const { capture: capturePrependAnchor, clear: clearPrependAnchor } = usePrependScrollRestore({
    events,
    headerOffsetPx: headerH ?? 0,
  });

  const bumpInfiniteScrollResetKey = useCallback(() => {
    setInfiniteScrollResetKey((x) => x + 1);
  }, []);

  const fetchAroundAndReplace = useCallback(
    async (anchorYmd: string): Promise<Event[]> => {
      const res = await queryClient.fetchQuery(
        feedAroundQueryOptions({
          anchorYmd,
          beforeLimit: clientEnv.feedPageSize,
          afterLimit: clientEnv.feedPageSize,
          country,
          city,
        }),
      );

      const mappedBefore: Event[] = res.before.map((gig) => {
        return gigToEvent(gig, { resolveCountryName, resolveCityName });
      });
      const mappedAfter: Event[] = res.after.map((gig) => {
        return gigToEvent(gig, { resolveCountryName, resolveCityName });
      });
      const windowEvents = mergeUniqueSorted(mappedBefore, mappedAfter);
      replaceWithWindow({
        events: windowEvents,
        prevCursor: res.prevCursor,
        nextCursor: res.nextCursor,
      });
      return windowEvents;
    },
    [city, country, queryClient, replaceWithWindow, resolveCityName, resolveCountryName],
  );

  const fetchHashTargetAnchorYmd = useCallback(
    (publicId: string): Promise<string> => {
      return queryClient.fetchQuery(feedAnchorDateByPublicIdQueryOptions(publicId));
    },
    [queryClient],
  );

  const loadAroundAndReplace = useCallback(
    async (anchorYmd: string): Promise<void> => {
      await fetchAroundAndReplace(anchorYmd);
    },
    [fetchAroundAndReplace],
  );

  const fetchNextPage = useCallback(async () => {
    await fetchNextFeedPage();
  }, [fetchNextFeedPage]);

  const fetchPrevPage = useCallback(async () => {
    capturePrependAnchor();

    try {
      await fetchPrevFeedPage();
    } catch (err) {
      clearPrependAnchor();
      throw err;
    }
  }, [capturePrependAnchor, clearPrependAnchor, fetchPrevFeedPage]);

  const visibleError = error ?? feedError;

  const { visibleEventDate, visibleEventDateRange } = useVisibleEventDateOnScroll({
    events,
    headerOffsetPx: headerH ?? 0,
  });

  useHashAutoScroll({ events, headerOffsetPx: headerH ?? 0, extraOffsetPx: 32 });
  useEventHashLoader({
    isEnabled: !isInitialLoading,
    isBusyRef: inFlightJumpRef,
    setIsBusy: (next) => {
      inFlightJumpRef.current = next;
    },
    dispatchLoading,
    setError,
    bumpInfiniteScrollResetKey,
    resolveAnchorYmdByEventId: fetchHashTargetAnchorYmd,
    loadAroundAndReplace,
  });

  const { sentinelRef: bottomSentinelRef } = useInfiniteScroll({
    isEnabled: true,
    canLoadMore: hasMore && !isInitialLoading && !isLoadingNext && !loading.jump,
    isLoading: isInitialLoading || isLoadingNext || loading.jump,
    onLoadMore: fetchNextPage,
    infiniteScrollResetKey,
  });

  const { sentinelRef: topSentinelRef } = useInfiniteScroll({
    isEnabled: true,
    canLoadMore: hasPrev && !isInitialLoading && !isLoadingPrev && !loading.jump,
    isLoading: isInitialLoading || isLoadingPrev || loading.jump,
    onLoadMore: fetchPrevPage,
    rootMargin: '400px 0px',
    infiniteScrollResetKey,
  });

  const registerEventRef = useCallback((eventId: string, element: HTMLElement | null) => {
    if (element) {
      eventRefs.current.set(eventId, element);
    } else {
      eventRefs.current.delete(eventId);
    }
  }, []);

  const handleDayClick = useCallback(
    async (day: Date) => {
      const key = toLocalYMD(day);

      clearHashFromUrl();

      const scrollToTarget = (el: HTMLElement) => {
        const headerPx = headerH ?? 0;
        const EXTRA_OFFSET_PX = 32;
        const top = window.scrollY + el.getBoundingClientRect().top - headerPx - EXTRA_OFFSET_PX;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      };

      // 1) Try to scroll to an already-loaded anchor.
      let target = document.querySelector<HTMLElement>(`[data-date="${key}"]`);
      if (!target) {
        const firstEvent = events.find((e) => e.date === key);
        if (firstEvent) {
          target = eventRefs.current.get(String(firstEvent.id)) || null;
        }
      }
      if (target) {
        scrollToTarget(target);
        return;
      }

      // 2) Not loaded yet — fetch a chunk around the date and then scroll.
      if (inFlightJumpRef.current) return;
      inFlightJumpRef.current = true;
      dispatchLoading({ type: 'jump:start' });
      setError(null);
      bumpInfiniteScrollResetKey();

      try {
        const windowEvents = await fetchAroundAndReplace(key);

        // Double rAF: with a React Query cache hit, fetchAroundAndReplace can return before
        // the next paint; one frame is not always enough for FeedMonths to mount [data-date].
        await new Promise<void>((r) =>
          requestAnimationFrame(() => requestAnimationFrame(() => r())),
        );
        target = document.querySelector<HTMLElement>(`[data-date="${key}"]`);
        if (!target) {
          const firstEvent = windowEvents.find((e) => e.date === key);
          if (firstEvent) {
            target = eventRefs.current.get(String(firstEvent.id)) || null;
          }
        }
        if (!target) {
          throw new Error(`Failed to locate target date after load: ${key}`);
        }
        scrollToTarget(target);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to jump to date.';
        setError(message);
      } finally {
        dispatchLoading({ type: 'jump:end' });
        inFlightJumpRef.current = false;
      }
    },
    [clearHashFromUrl, events, fetchAroundAndReplace, headerH, bumpInfiniteScrollResetKey],
  );

  useFeedHeaderConfigSync({
    setHeaderConfig,
    visibleEventDate,
    visibleEventDateRange,
    onDayClick: handleDayClick,
  });

  if (isInitialLoading) {
    return (
      <div className="min-h-[100svh]">
        <main className={feedMainClassName}>
          <div className="flex justify-center items-center h-96">
            <div className="text-lg">Loading events...</div>
          </div>
        </main>
      </div>
    );
  }

  if (visibleError) {
    return (
      <div className="min-h-[100svh]">
        <main className={feedMainClassName}>
          <div className="flex justify-center items-center h-96">
            <div className="text-lg text-red-600">Error: {visibleError}</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh]">
      <main className={feedMainClassName}>
        <div className="w-full px-8 md:px-8 py-8">
          {loading.jump ? (
            <div
              className="fixed left-1/2 -translate-x-1/2 z-50"
              style={{ top: 'calc(var(--header-h) + 8px)' }}
              aria-live="polite"
            >
              <div className="jump-toast-pulse rounded-lg border border-border bg-popover px-5 py-2.5 text-base text-popover-foreground shadow-lg">
                Jumping…
              </div>
            </div>
          ) : null}
          <div
            ref={topSentinelRef}
            className="h-px"
            aria-hidden
          />
          {isLoadingPrev ? (
            <div className="py-4 text-center text-gray-500">Loading previous…</div>
          ) : null}
          <div className="animate-in fade-in-0 duration-500 motion-reduce:animate-none">
            <FeedMonths
              events={events}
              registerEventRef={registerEventRef}
            />
          </div>

          <div
            ref={bottomSentinelRef}
            className="h-12"
            aria-hidden
          />
          {isLoadingNext ? (
            <div className="py-4 text-center text-gray-500">Loading more…</div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
