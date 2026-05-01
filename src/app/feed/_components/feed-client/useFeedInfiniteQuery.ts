import { useCallback, useEffect, useRef, useState } from 'react';

import type { Event, V1GigGetResponseBodyGig } from '@/lib/types';

import { clientEnv } from '@/env/client-env';
import { gigToEvent } from '@/lib/feed.mapper';
import { fetchFeedPage } from './feedApi';
import { mergeUniqueSorted, sortEventsAsc } from './feedEvents';

export interface UseFeedInfiniteQueryParams {
  readonly country: string;
  readonly city: string;
  readonly initialEvents?: readonly Event[];
  readonly initialPrevCursor?: string;
  readonly initialNextCursor?: string;
  readonly resolveCountryName: (iso: string) => string;
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

function mapGigsToEvents(
  gigs: readonly V1GigGetResponseBodyGig[],
  resolveCountryName: (iso: string) => string,
): Event[] {
  return gigs.map((gig) => gigToEvent(gig, { resolveCountryName }));
}

export function useFeedInfiniteQuery(
  params: UseFeedInfiniteQueryParams,
): UseFeedInfiniteQueryResult {
  const { country, city, initialEvents, initialPrevCursor, initialNextCursor, resolveCountryName } =
    params;

  const [events, setEvents] = useState<Event[]>(() => [...(initialEvents ?? [])]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(() => initialNextCursor);
  const [prevCursor, setPrevCursor] = useState<string | undefined>(() => initialPrevCursor);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(
    () => initialEvents === undefined,
  );
  const [isLoadingNext, setIsLoadingNext] = useState<boolean>(false);
  const [isLoadingPrev, setIsLoadingPrev] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const inFlightNextRef = useRef(false);
  const inFlightPrevRef = useRef(false);
  const appliedInitialSnapshotRef = useRef<string | null>(null);
  const resolveCountryNameRef = useRef(resolveCountryName);

  useEffect(() => {
    resolveCountryNameRef.current = resolveCountryName;
  }, [resolveCountryName]);

  const fetchNextPage = useCallback(async (): Promise<void> => {
    if (!nextCursor) return;
    if (inFlightNextRef.current) return;
    inFlightNextRef.current = true;

    try {
      setIsLoadingNext(true);
      const result = await fetchFeedPage({
        limit: clientEnv.feedPageSize,
        cursor: nextCursor,
        country,
        city,
      });
      const mappedEvents = mapGigsToEvents(result.gigs, resolveCountryNameRef.current);

      setEvents((prev) => mergeUniqueSorted(prev, mappedEvents));
      setNextCursor(result.nextCursor);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'An error occurred');
    } finally {
      setIsLoadingNext(false);
      inFlightNextRef.current = false;
    }
  }, [city, country, nextCursor]);

  const fetchPrevPage = useCallback(async (): Promise<void> => {
    if (!prevCursor) return;
    if (inFlightPrevRef.current) return;
    inFlightPrevRef.current = true;

    try {
      setIsLoadingPrev(true);
      const result = await fetchFeedPage({
        limit: clientEnv.feedPageSize,
        cursor: prevCursor,
        direction: 'prev',
        country,
        city,
      });
      const mappedEvents = mapGigsToEvents(result.gigs, resolveCountryNameRef.current);

      if (mappedEvents.length === 0) {
        setPrevCursor(undefined);
        return;
      }

      setEvents((prev) => mergeUniqueSorted(prev, mappedEvents));
      if (!result.prevCursor || result.prevCursor === prevCursor) {
        setPrevCursor(undefined);
        return;
      }
      setPrevCursor(result.prevCursor);
    } catch (prevError) {
      setError(prevError instanceof Error ? prevError.message : 'An error occurred');
    } finally {
      setIsLoadingPrev(false);
      inFlightPrevRef.current = false;
    }
  }, [city, country, prevCursor]);

  const fetchInitial = useCallback(async (): Promise<void> => {
    try {
      setIsInitialLoading(true);
      setError(null);
      const result = await fetchFeedPage({
        limit: clientEnv.feedPageSize,
        country,
        city,
      });
      const mappedEvents = mapGigsToEvents(result.gigs, resolveCountryNameRef.current);

      setPrevCursor(result.prevCursor);
      setNextCursor(result.nextCursor);
      setEvents(sortEventsAsc(mappedEvents));
    } catch (initialError) {
      setError(initialError instanceof Error ? initialError.message : 'An error occurred');
    } finally {
      setIsInitialLoading(false);
      setIsLoadingNext(false);
      setIsLoadingPrev(false);
      inFlightNextRef.current = false;
      inFlightPrevRef.current = false;
    }
  }, [city, country]);

  const replaceWithWindow = useCallback((replaceParams: ReplaceFeedWindowParams): void => {
    setEvents([...replaceParams.events]);
    setPrevCursor(replaceParams.prevCursor);
    setNextCursor(replaceParams.nextCursor);
    setError(null);
  }, []);

  useEffect(() => {
    if (initialEvents === undefined) {
      appliedInitialSnapshotRef.current = null;
      return;
    }

    const firstId = initialEvents[0]?.id ?? '';
    const lastId = initialEvents[initialEvents.length - 1]?.id ?? '';
    const snapshot = [
      country,
      city,
      initialPrevCursor ?? '',
      initialNextCursor ?? '',
      String(initialEvents.length),
      firstId,
      lastId,
    ].join('|');

    if (appliedInitialSnapshotRef.current === snapshot) {
      return;
    }
    appliedInitialSnapshotRef.current = snapshot;

    setEvents([...initialEvents]);
    setPrevCursor(initialPrevCursor);
    setNextCursor(initialNextCursor);
    setError(null);
    setIsInitialLoading(false);
    setIsLoadingNext(false);
    setIsLoadingPrev(false);
    inFlightNextRef.current = false;
    inFlightPrevRef.current = false;
  }, [city, country, initialEvents, initialNextCursor, initialPrevCursor]);

  useEffect(() => {
    if (initialEvents !== undefined) {
      return;
    }
    void fetchInitial();
  }, [fetchInitial, initialEvents]);

  return {
    events,
    hasMore: Boolean(nextCursor),
    hasPrev: Boolean(prevCursor),
    isInitialLoading,
    isLoadingNext,
    isLoadingPrev,
    error,
    fetchNextPage,
    fetchPrevPage,
    replaceWithWindow,
  };
}
