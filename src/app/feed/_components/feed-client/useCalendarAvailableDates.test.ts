// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';

import type { PropsWithChildren, ReactElement } from 'react';

import { fetchFeedAvailableDates } from './feedApi';
import { useCalendarAvailableDates } from './useCalendarAvailableDates';

interface FetchFeedAvailableDatesParams {
  readonly country: string;
  readonly city: string;
  readonly signal: AbortSignal;
}

const { fetchFeedAvailableDatesMock } = vi.hoisted(() => ({
  fetchFeedAvailableDatesMock:
    vi.fn<(params: FetchFeedAvailableDatesParams) => Promise<string[]>>(),
}));

vi.mock('./feedApi', () => ({
  fetchFeedAvailableDates: fetchFeedAvailableDatesMock,
}));

function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

function createWrapper(queryClient: QueryClient): (props: PropsWithChildren) => ReactElement {
  return function TestQueryClientProvider({ children }: PropsWithChildren): ReactElement {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useCalendarAvailableDates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should fetch available dates when query is enabled', async () => {
    vi.mocked(fetchFeedAvailableDates).mockResolvedValueOnce(['2026-04-21']);

    const queryClient = createTestQueryClient();

    const { result } = renderHook(
      () =>
        useCalendarAvailableDates({
          country: 'es',
          city: 'barcelona',
          isEnabled: true,
        }),
      {
        wrapper: createWrapper(queryClient),
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

  it('should not fetch available dates when query is disabled', () => {
    const queryClient = createTestQueryClient();

    const { result } = renderHook(
      () =>
        useCalendarAvailableDates({
          country: 'es',
          city: 'barcelona',
          isEnabled: false,
        }),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    expect(result.current).toEqual({
      availableDates: undefined,
      error: null,
      isLoading: false,
      isError: false,
      isSuccess: false,
    });
    expect(vi.mocked(fetchFeedAvailableDates)).not.toHaveBeenCalled();
  });

  it('should expose loading state when query is pending', async () => {
    vi.mocked(fetchFeedAvailableDates).mockImplementationOnce(() => new Promise(() => {}));

    const queryClient = createTestQueryClient();

    const { result } = renderHook(
      () =>
        useCalendarAvailableDates({
          country: 'es',
          city: 'barcelona',
          isEnabled: true,
        }),
      {
        wrapper: createWrapper(queryClient),
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
          isEnabled: true,
        }),
      {
        wrapper: createWrapper(queryClient),
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
          isEnabled: true,
        }),
      {
        initialProps: {
          country: 'es',
          city: 'barcelona',
        },
        wrapper: createWrapper(queryClient),
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

      return new Promise(() => {});
    });

    const queryClient = createTestQueryClient();

    const { unmount } = renderHook(
      () =>
        useCalendarAvailableDates({
          country: 'es',
          city: 'barcelona',
          isEnabled: true,
        }),
      {
        wrapper: createWrapper(queryClient),
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

      return new Promise(() => {});
    });

    const queryClient = createTestQueryClient();

    renderHook(
      () =>
        useCalendarAvailableDates({
          country: 'es',
          city: 'barcelona',
          isEnabled: true,
        }),
      {
        wrapper: createWrapper(queryClient),
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
