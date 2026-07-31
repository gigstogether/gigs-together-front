// @vitest-environment jsdom

import { act, renderHook, waitFor } from '@testing-library/react';

import { fetchFeedAvailableDates } from '@/app/feed/_components/feed-client/feedApi';
import { useCalendarAvailableDates } from '@/app/_components/useCalendarAvailableDates';
import { createQueryClientWrapper, createTestQueryClient } from '@/test-utils/react-query-client';

interface FetchFeedAvailableDatesParams {
  readonly country: string;
  readonly city: string;
  readonly signal: AbortSignal;
}

const { fetchFeedAvailableDatesMock } = vi.hoisted(() => ({
  fetchFeedAvailableDatesMock:
    vi.fn<(params: FetchFeedAvailableDatesParams) => Promise<string[]>>(),
}));

vi.mock('@/app/feed/_components/feed-client/feedApi', () => ({
  fetchFeedAvailableDates: fetchFeedAvailableDatesMock,
}));

describe('useCalendarAvailableDates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should fetch available dates for the location', async () => {
    vi.mocked(fetchFeedAvailableDates).mockResolvedValueOnce(['2026-04-21']);

    const queryClient = createTestQueryClient();

    const { result } = renderHook(
      () =>
        useCalendarAvailableDates({
          country: 'es',
          city: 'barcelona',
        }),
      {
        wrapper: createQueryClientWrapper(queryClient),
      },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.availableDates).toEqual(['2026-04-21']);
    expect(vi.mocked(fetchFeedAvailableDates)).toHaveBeenCalledWith({
      country: 'es',
      city: 'barcelona',
      signal: expect.any(AbortSignal),
    });
  });

  it('should expose loading state when query is pending', async () => {
    vi.mocked(fetchFeedAvailableDates).mockImplementationOnce(
      () => new Promise<string[]>(() => {}),
    );

    const queryClient = createTestQueryClient();

    const { result } = renderHook(
      () =>
        useCalendarAvailableDates({
          country: 'es',
          city: 'barcelona',
        }),
      {
        wrapper: createQueryClientWrapper(queryClient),
      },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });
  });

  it('should expose error state when request fails', async () => {
    const error = new Error('Network error');
    vi.mocked(fetchFeedAvailableDates).mockRejectedValueOnce(error);

    const queryClient = createTestQueryClient();

    const { result } = renderHook(
      () =>
        useCalendarAvailableDates({
          country: 'es',
          city: 'barcelona',
        }),
      {
        wrapper: createQueryClientWrapper(queryClient),
      },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(error);
    expect(result.current.availableDates).toBeUndefined();
  });

  it('should refetch available dates when location changes', async () => {
    vi.mocked(fetchFeedAvailableDates)
      .mockResolvedValueOnce(['2026-04-21'])
      .mockResolvedValueOnce(['2026-05-01']);

    const queryClient = createTestQueryClient();

    const { result, rerender } = renderHook(
      ({ country, city }) =>
        useCalendarAvailableDates({
          country,
          city,
        }),
      {
        initialProps: {
          country: 'es',
          city: 'barcelona',
        },
        wrapper: createQueryClientWrapper(queryClient),
      },
    );

    await waitFor(() => {
      expect(result.current.availableDates).toEqual(['2026-04-21']);
    });

    rerender({
      country: 'fr',
      city: 'paris',
    });

    await waitFor(() => {
      expect(result.current.availableDates).toEqual(['2026-05-01']);
    });

    expect(vi.mocked(fetchFeedAvailableDates)).toHaveBeenNthCalledWith(1, {
      country: 'es',
      city: 'barcelona',
      signal: expect.any(AbortSignal),
    });
    expect(vi.mocked(fetchFeedAvailableDates)).toHaveBeenNthCalledWith(2, {
      country: 'fr',
      city: 'paris',
      signal: expect.any(AbortSignal),
    });
  });

  it('should abort fetch signal when hook unmounts', async () => {
    let receivedSignal: AbortSignal | undefined;

    vi.mocked(fetchFeedAvailableDates).mockImplementationOnce(({ signal }) => {
      receivedSignal = signal;

      return new Promise<string[]>(() => {});
    });

    const queryClient = createTestQueryClient();

    const { unmount } = renderHook(
      () =>
        useCalendarAvailableDates({
          country: 'es',
          city: 'barcelona',
        }),
      {
        wrapper: createQueryClientWrapper(queryClient),
      },
    );

    await waitFor(() => {
      expect(receivedSignal).toBeDefined();
    });

    unmount();

    await waitFor(() => {
      expect(receivedSignal?.aborted).toBe(true);
    });
  });

  it('should abort fetch signal when timeout is reached', async () => {
    vi.useFakeTimers();

    let receivedSignal: AbortSignal | undefined;

    vi.mocked(fetchFeedAvailableDates).mockImplementationOnce(({ signal }) => {
      receivedSignal = signal;

      return new Promise<string[]>(() => {});
    });

    const queryClient = createTestQueryClient();

    renderHook(
      () =>
        useCalendarAvailableDates({
          country: 'es',
          city: 'barcelona',
        }),
      {
        wrapper: createQueryClientWrapper(queryClient),
      },
    );

    await vi.waitFor(() => {
      expect(receivedSignal).toBeDefined();
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(15_000);
    });

    expect(receivedSignal?.aborted).toBe(true);
  });
});
