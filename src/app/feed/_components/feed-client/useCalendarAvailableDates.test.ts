import { clientEnv } from '@/env/client-env';
import { fetchFeedAvailableDates } from './feedApi';
import { useCalendarAvailableDates } from './useCalendarAvailableDates';

interface QueryFunctionContext {
  readonly signal: AbortSignal;
}

type CalendarDatesQueryKey = readonly ['feed', 'calendar-available-dates', string];

interface CalendarDatesQueryOptions {
  readonly queryKey: CalendarDatesQueryKey;
  readonly enabled: boolean;
  readonly staleTime: number;
  readonly queryFn: (context: QueryFunctionContext) => Promise<string[]>;
}

interface FetchFeedAvailableDatesParams {
  readonly country?: string;
  readonly city?: string;
  readonly signal?: AbortSignal;
}

interface QueryResultState {
  readonly isSuccess: boolean;
  readonly isPending: boolean;
  readonly isLoading: boolean;
  readonly isFetching: boolean;
  readonly isError: boolean;
  readonly error: Error | null;
  readonly data: string[] | undefined;
}

const { useQueryMock, fetchFeedAvailableDatesMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn<(options: CalendarDatesQueryOptions) => QueryResultState>(),
  fetchFeedAvailableDatesMock:
    vi.fn<(params: FetchFeedAvailableDatesParams) => Promise<string[]>>(),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: useQueryMock,
}));

vi.mock('./feedApi', () => ({
  fetchFeedAvailableDates: fetchFeedAvailableDatesMock,
}));

const DEFAULT_QUERY_RESULT_STATE: QueryResultState = {
  isSuccess: false,
  isPending: false,
  isLoading: false,
  isFetching: false,
  isError: false,
  error: null,
  data: undefined,
};

function createQueryResultState(overrides: Partial<QueryResultState>): QueryResultState {
  return {
    ...DEFAULT_QUERY_RESULT_STATE,
    ...overrides,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isCalendarDatesQueryOptions(value: unknown): value is CalendarDatesQueryOptions {
  if (!isRecord(value)) {
    return false;
  }

  const candidate = value;
  if (!Array.isArray(candidate.queryKey) || candidate.queryKey.length !== 3) {
    return false;
  }

  const [scope, entity, location] = candidate.queryKey;
  return (
    scope === 'feed' &&
    entity === 'calendar-available-dates' &&
    typeof location === 'string' &&
    typeof candidate.enabled === 'boolean' &&
    typeof candidate.staleTime === 'number' &&
    typeof candidate.queryFn === 'function'
  );
}

function getQueryOptionsFromFirstUseQueryCall(): CalendarDatesQueryOptions {
  const firstCall = useQueryMock.mock.calls[0];
  if (!firstCall) {
    throw new Error('Expected useQuery to be called');
  }

  const [options] = firstCall;
  if (!isCalendarDatesQueryOptions(options)) {
    throw new Error('Expected useQuery to receive calendar dates query options');
  }

  return options;
}

function setupUseQueryResult(state: QueryResultState): void {
  useQueryMock.mockReturnValueOnce(state);
}

describe('useCalendarAvailableDates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('window', globalThis);
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('should expose loading state when query is pending', () => {
    setupUseQueryResult(
      createQueryResultState({
        isPending: true,
        isLoading: true,
      }),
    );

    const result = useCalendarAvailableDates({
      country: 'es',
      city: 'barcelona',
      isEnabled: true,
    });

    expect(result).toEqual({
      availableDates: undefined,
      error: null,
      isLoading: true,
      isError: false,
      isSuccess: false,
    });
  });

  it('should set query key when country and city are provided', () => {
    setupUseQueryResult(createQueryResultState({}));

    useCalendarAvailableDates({
      country: 'es',
      city: 'barcelona',
      isEnabled: true,
    });
    const options = getQueryOptionsFromFirstUseQueryCall();

    expect(options.queryKey).toEqual(['feed', 'calendar-available-dates', 'es|barcelona']);
  });

  it('should set query enabled flag from params', () => {
    setupUseQueryResult(createQueryResultState({}));

    useCalendarAvailableDates({
      country: 'es',
      city: 'barcelona',
      isEnabled: true,
    });
    const options = getQueryOptionsFromFirstUseQueryCall();

    expect(options.enabled).toBe(true);
  });

  it('should set calendar dates stale time constant', () => {
    setupUseQueryResult(createQueryResultState({}));

    useCalendarAvailableDates({
      country: 'es',
      city: 'barcelona',
      isEnabled: true,
    });
    const options = getQueryOptionsFromFirstUseQueryCall();

    expect(options.staleTime).toBe(clientEnv.feedCalendarDatesStaleTimeMs);
  });

  it('should call fetchFeedAvailableDates when queryFn is executed', async () => {
    setupUseQueryResult(createQueryResultState({ isSuccess: true, data: ['2026-04-21'] }));

    vi.mocked(fetchFeedAvailableDates).mockResolvedValueOnce(['2026-04-21']);

    useCalendarAvailableDates({
      country: 'es',
      city: 'barcelona',
      isEnabled: true,
    });
    const options = getQueryOptionsFromFirstUseQueryCall();
    const querySignalController = new AbortController();

    await options.queryFn({ signal: querySignalController.signal });

    expect(vi.mocked(fetchFeedAvailableDates)).toHaveBeenCalledWith({
      country: 'es',
      city: 'barcelona',
      signal: expect.any(AbortSignal),
    });
  });

  it('should abort fetch signal when query signal is aborted', async () => {
    setupUseQueryResult(createQueryResultState({ isFetching: true }));

    vi.mocked(fetchFeedAvailableDates).mockImplementationOnce(async ({ signal }) => {
      if (!signal) {
        throw new Error('Expected signal to be defined');
      }

      await Promise.resolve();
      return [signal.aborted ? 'aborted' : 'active'];
    });

    useCalendarAvailableDates({
      country: 'es',
      city: 'barcelona',
      isEnabled: true,
    });
    const options = getQueryOptionsFromFirstUseQueryCall();
    const querySignalController = new AbortController();

    const resultPromise = options.queryFn({ signal: querySignalController.signal });
    querySignalController.abort();
    const result = await resultPromise;

    expect(result).toEqual(['aborted']);
  });

  it('should abort fetch signal when timeout is reached', async () => {
    vi.useFakeTimers();
    setupUseQueryResult(createQueryResultState({ isFetching: true }));

    vi.mocked(fetchFeedAvailableDates).mockImplementationOnce(
      ({ signal }) =>
        new Promise((resolve) => {
          if (!signal) {
            throw new Error('Expected signal to be defined');
          }

          window.setTimeout(() => {
            resolve([signal.aborted ? 'aborted' : 'active']);
          }, 15_001);
        }),
    );

    useCalendarAvailableDates({
      country: 'es',
      city: 'barcelona',
      isEnabled: true,
    });
    const options = getQueryOptionsFromFirstUseQueryCall();
    const querySignalController = new AbortController();

    const resultPromise = options.queryFn({ signal: querySignalController.signal });
    await vi.advanceTimersByTimeAsync(15_001);
    const result = await resultPromise;

    expect(result).toEqual(['aborted']);
  });
});
