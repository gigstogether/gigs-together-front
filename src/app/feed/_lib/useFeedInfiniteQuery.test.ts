// @vitest-environment jsdom

import { act, renderHook, waitFor } from '@testing-library/react';

import type { Event, V1GigGetResponseBody } from '@/lib/types';

import { createQueryClientWrapper, createTestQueryClient } from '@/test-utils/react-query-client';
import { useFeedInfiniteQuery } from './useFeedInfiniteQuery';

interface FetchFeedPageParams {
  readonly limit: number;
  readonly cursor?: string;
  readonly direction?: 'prev';
  readonly country?: string;
  readonly city?: string;
  readonly signal?: AbortSignal;
}

const { fetchFeedPageMock } = vi.hoisted(() => ({
  fetchFeedPageMock: vi.fn<(params: FetchFeedPageParams) => Promise<V1GigGetResponseBody>>(),
}));

vi.mock('./feedApi', () => ({
  fetchFeedPage: fetchFeedPageMock,
}));

interface Deferred<TValue> {
  readonly promise: Promise<TValue>;
  readonly resolve: (value: TValue) => void;
}

function createDeferred<TValue>(): Deferred<TValue> {
  let resolve: ((value: TValue) => void) | undefined;
  const promise = new Promise<TValue>((promiseResolve) => {
    resolve = promiseResolve;
  });

  if (!resolve) {
    throw new Error('Deferred promise resolver was not initialized.');
  }

  return {
    promise,
    resolve,
  };
}

function createEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 'gig-1',
    title: 'Arctic Monkeys',
    date: '2026-07-01',
    city: {
      code: 'barcelona',
      name: 'Barcelona',
    },
    venue: 'Razzmatazz',
    country: {
      iso: 'es',
      name: 'Spain',
    },
    ...overrides,
  };
}

describe('useFeedInfiniteQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should expose initial events from server data immediately', () => {
    const queryClient = createTestQueryClient();

    const { result } = renderHook(
      () =>
        useFeedInfiniteQuery({
          country: 'es',
          city: 'barcelona',
          initialEvents: [createEvent()],
          initialPrevCursor: 'prev-1',
          initialNextCursor: 'next-1',
          resolveCountryName: () => 'Spain',
          resolveCityName: () => 'Barcelona',
        }),
      {
        wrapper: createQueryClientWrapper(queryClient),
      },
    );

    expect(result.current.events).toEqual([createEvent()]);
    expect(result.current.hasPrev).toBe(true);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.isInitialLoading).toBe(false);
  });

  it('should fetch initial events when no initial snapshot is provided', async () => {
    const queryClient = createTestQueryClient();

    fetchFeedPageMock.mockResolvedValueOnce({
      gigs: [
        {
          id: 'gig-2',
          title: 'The Strokes',
          date: '2026-07-02',
          city: 'Barcelona',
          country: 'es',
          venue: 'Apolo',
          ticketsUrl: 'https://tickets.example/gig-2',
        },
      ],
      nextCursor: 'next-2',
    });

    const { result } = renderHook(
      () =>
        useFeedInfiniteQuery({
          country: 'es',
          city: 'barcelona',
          resolveCountryName: () => 'Spain',
          resolveCityName: () => 'Barcelona',
        }),
      {
        wrapper: createQueryClientWrapper(queryClient),
      },
    );

    await waitFor(() => {
      expect(result.current.isInitialLoading).toBe(false);
    });

    expect(fetchFeedPageMock).toHaveBeenCalledWith({
      limit: expect.any(Number),
      country: 'es',
      city: 'barcelona',
      cursor: undefined,
      direction: undefined,
      signal: expect.any(AbortSignal),
    });
    expect(result.current.events.map((event) => event.id)).toEqual(['gig-2']);
    expect(result.current.hasMore).toBe(true);
  });

  it('should fetch the next page and merge events when requested', async () => {
    const queryClient = createTestQueryClient();

    fetchFeedPageMock.mockResolvedValueOnce({
      gigs: [
        {
          id: 'gig-2',
          title: 'The Strokes',
          date: '2026-07-02',
          city: 'Barcelona',
          country: 'es',
          venue: 'Apolo',
          ticketsUrl: 'https://tickets.example/gig-2',
        },
      ],
      prevCursor: 'prev-2',
      nextCursor: 'next-2',
    });

    const { result } = renderHook(
      () =>
        useFeedInfiniteQuery({
          country: 'es',
          city: 'barcelona',
          initialEvents: [createEvent()],
          initialNextCursor: 'next-1',
          resolveCountryName: () => 'Spain',
          resolveCityName: () => 'Barcelona',
        }),
      {
        wrapper: createQueryClientWrapper(queryClient),
      },
    );

    await act(async () => {
      await result.current.fetchNextPage();
    });

    expect(fetchFeedPageMock).toHaveBeenCalledWith({
      limit: expect.any(Number),
      cursor: 'next-1',
      direction: undefined,
      country: 'es',
      city: 'barcelona',
      signal: expect.any(AbortSignal),
    });
    await waitFor(() => {
      expect(result.current.events.map((event) => event.id)).toEqual(['gig-1', 'gig-2']);
    });
  });

  it('should fetch the previous page when requested', async () => {
    const queryClient = createTestQueryClient();

    fetchFeedPageMock.mockResolvedValueOnce({
      gigs: [
        {
          id: 'gig-0',
          title: 'Phoenix',
          date: '2026-06-30',
          city: 'Barcelona',
          country: 'es',
          venue: 'Sala',
          ticketsUrl: 'https://tickets.example/gig-0',
        },
      ],
      prevCursor: 'prev-0',
      nextCursor: 'next-0',
    });

    const { result } = renderHook(
      () =>
        useFeedInfiniteQuery({
          country: 'es',
          city: 'barcelona',
          initialEvents: [createEvent()],
          initialPrevCursor: 'prev-1',
          resolveCountryName: () => 'Spain',
          resolveCityName: () => 'Barcelona',
        }),
      {
        wrapper: createQueryClientWrapper(queryClient),
      },
    );

    await act(async () => {
      await result.current.fetchPrevPage();
    });

    expect(fetchFeedPageMock).toHaveBeenCalledWith({
      limit: expect.any(Number),
      cursor: 'prev-1',
      direction: 'prev',
      country: 'es',
      city: 'barcelona',
      signal: expect.any(AbortSignal),
    });
    await waitFor(() => {
      expect(result.current.events.map((event) => event.id)).toEqual(['gig-0', 'gig-1']);
    });
  });

  it('should not restart the previous page request when called twice before completion', async () => {
    const queryClient = createTestQueryClient();
    const deferredResponse = createDeferred<V1GigGetResponseBody>();

    fetchFeedPageMock.mockReturnValueOnce(deferredResponse.promise);

    const { result } = renderHook(
      () =>
        useFeedInfiniteQuery({
          country: 'es',
          city: 'barcelona',
          initialEvents: [createEvent()],
          initialPrevCursor: 'prev-1',
          resolveCountryName: () => 'Spain',
          resolveCityName: () => 'Barcelona',
        }),
      {
        wrapper: createQueryClientWrapper(queryClient),
      },
    );

    const requests: Promise<void>[] = [];

    await act(async () => {
      requests.push(result.current.fetchPrevPage(), result.current.fetchPrevPage());
      await Promise.resolve();
    });

    expect(fetchFeedPageMock).toHaveBeenCalledTimes(1);

    deferredResponse.resolve({
      gigs: [
        {
          id: 'gig-0',
          title: 'Phoenix',
          date: '2026-06-30',
          city: 'Barcelona',
          country: 'es',
          venue: 'Sala',
          ticketsUrl: 'https://tickets.example/gig-0',
        },
      ],
      prevCursor: 'prev-0',
      nextCursor: 'next-0',
    });

    await act(async () => {
      await Promise.all(requests);
    });

    await waitFor(() => {
      expect(result.current.events.map((event) => event.id)).toEqual(['gig-0', 'gig-1']);
    });
  });
});
