// @vitest-environment jsdom

import { act, renderHook, waitFor } from '@testing-library/react';

import type { Event, V1GigGetResponseBody } from '@/lib/types';

import { useFeedInfiniteQuery } from './useFeedInfiniteQuery';

interface FetchFeedPageParams {
  readonly limit: number;
  readonly cursor?: string;
  readonly direction?: 'prev';
  readonly country?: string;
  readonly city?: string;
}

const { fetchFeedPageMock } = vi.hoisted(() => ({
  fetchFeedPageMock: vi.fn<(params: FetchFeedPageParams) => Promise<V1GigGetResponseBody>>(),
}));

vi.mock('./feedApi', () => ({
  fetchFeedPage: fetchFeedPageMock,
}));

function createEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 'gig-1',
    title: 'Arctic Monkeys',
    date: '2026-07-01',
    city: 'Barcelona',
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
    const { result } = renderHook(() =>
      useFeedInfiniteQuery({
        country: 'es',
        city: 'barcelona',
        initialEvents: [createEvent()],
        initialPrevCursor: 'prev-1',
        initialNextCursor: 'next-1',
        resolveCountryName: () => 'Spain',
      }),
    );

    expect(result.current.events).toEqual([createEvent()]);
    expect(result.current.hasPrev).toBe(true);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.isInitialLoading).toBe(false);
  });

  it('should fetch initial events when no initial snapshot is provided', async () => {
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

    const { result } = renderHook(() =>
      useFeedInfiniteQuery({
        country: 'es',
        city: 'barcelona',
        resolveCountryName: () => 'Spain',
      }),
    );

    await waitFor(() => {
      expect(result.current.isInitialLoading).toBe(false);
    });

    expect(fetchFeedPageMock).toHaveBeenCalledWith({
      limit: expect.any(Number),
      country: 'es',
      city: 'barcelona',
    });
    expect(result.current.events.map((event) => event.id)).toEqual(['gig-2']);
    expect(result.current.hasMore).toBe(true);
  });

  it('should fetch the next page and merge events when requested', async () => {
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

    const { result } = renderHook(() =>
      useFeedInfiniteQuery({
        country: 'es',
        city: 'barcelona',
        initialEvents: [createEvent()],
        initialNextCursor: 'next-1',
        resolveCountryName: () => 'Spain',
      }),
    );

    await act(async () => {
      await result.current.fetchNextPage();
    });

    expect(fetchFeedPageMock).toHaveBeenCalledWith({
      limit: expect.any(Number),
      cursor: 'next-1',
      country: 'es',
      city: 'barcelona',
    });
    expect(result.current.events.map((event) => event.id)).toEqual(['gig-1', 'gig-2']);
  });
});
