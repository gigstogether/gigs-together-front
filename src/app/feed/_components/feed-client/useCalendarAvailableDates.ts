import { useQuery } from '@tanstack/react-query';
import { fetchFeedAvailableDates } from './feedApi';
import { feedKeys } from './feedKeys';
import { clientEnv } from '@/env/client-env';

export interface UseCalendarAvailableDatesParams {
  country: string;
  city: string;
  isEnabled: boolean;
}

export interface UseCalendarAvailableDatesResult {
  readonly availableDates: string[] | undefined;
  readonly isError: boolean;
  readonly isSuccess: boolean;
  readonly isLoading: boolean;
  readonly error: Error | null;
}

const CALENDAR_DATES_TIMEOUT_MS = 15_000; // 15 seconds

export function useCalendarAvailableDates(
  params: UseCalendarAvailableDatesParams,
): UseCalendarAvailableDatesResult {
  const { country, city, isEnabled } = params;

  const query = useQuery<string[], Error>({
    queryKey: feedKeys.calendarAvailableDates({ country, city }),
    enabled: isEnabled,
    staleTime: clientEnv.feedCalendarDatesStaleTimeMs,
    queryFn: async ({ signal }) => {
      const timeoutController = new AbortController();
      const timeoutId = window.setTimeout(() => {
        timeoutController.abort();
      }, CALENDAR_DATES_TIMEOUT_MS);

      const abortFromQuerySignal = () => {
        timeoutController.abort();
      };

      signal.addEventListener('abort', abortFromQuerySignal);
      try {
        return await fetchFeedAvailableDates({ country, city, signal: timeoutController.signal });
      } finally {
        window.clearTimeout(timeoutId);
        signal.removeEventListener('abort', abortFromQuerySignal);
      }
    },
  });

  const { isSuccess, isPending, isError, error, data: availableDates } = query;

  return {
    availableDates,
    error,
    isLoading: isEnabled && isPending,
    isError,
    isSuccess,
  };
}
