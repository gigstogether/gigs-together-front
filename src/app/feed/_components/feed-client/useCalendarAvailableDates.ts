'use client';

import { useEffect, useRef, useState } from 'react';
import { fetchFeedAvailableDates } from './feedApi';

export interface UseCalendarAvailableDatesParams {
  country: string;
  city: string;
  enabled: boolean;
}

export interface UseCalendarAvailableDatesResult {
  availableDates: string[] | undefined;
  readonly isError: boolean;
  readonly isSuccess: boolean;
  readonly isLoading: boolean;
  error: string | undefined;
}

export function useCalendarAvailableDates(
  params: UseCalendarAvailableDatesParams,
): UseCalendarAvailableDatesResult {
  const { country, city, enabled } = params;

  const [availableDates, setAvailableDates] = useState<string[] | undefined>();
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | undefined>(undefined);

  const calendarAbortRef = useRef<AbortController | null>(null);
  const calendarRequestSeqRef = useRef<number>(0);
  const calendarDatesLoadedForLocationRef = useRef<string | null>(null);
  const lastLocationKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const locationKey = `${country}|${city}`;

    if (lastLocationKeyRef.current !== locationKey) {
      lastLocationKeyRef.current = locationKey;
      calendarDatesLoadedForLocationRef.current = null;
      setStatus('loading');
      setError(undefined);
      setAvailableDates(undefined);
    }

    if (!enabled) return;
    if (calendarDatesLoadedForLocationRef.current === locationKey) return;

    const ac = new AbortController();
    calendarAbortRef.current?.abort();
    calendarAbortRef.current = ac;
    const seq = (calendarRequestSeqRef.current += 1);
    const timeoutId = window.setTimeout(() => {
      ac.abort();
    }, 15_000);

    setStatus('loading');
    setError(undefined);
    setAvailableDates(undefined);

    const run = async () => {
      try {
        const unique = await fetchFeedAvailableDates({ country, city, signal: ac.signal });

        if (ac.signal.aborted) return;
        if (seq !== calendarRequestSeqRef.current) return;

        setAvailableDates(unique);
        setStatus('ready');
        calendarDatesLoadedForLocationRef.current = locationKey;
      } catch (e) {
        if (ac.signal.aborted) return;
        if (seq !== calendarRequestSeqRef.current) return;

        const message = e instanceof Error ? e.message : 'Failed to load calendar dates.';
        setStatus('error');
        setError(message);
        setAvailableDates(undefined);
      } finally {
        window.clearTimeout(timeoutId);
        if (calendarAbortRef.current === ac) calendarAbortRef.current = null;
      }
    };

    void run();
    return () => {
      window.clearTimeout(timeoutId);
      ac.abort();
    };
  }, [city, country, enabled]);

  return {
    availableDates,
    error,
    isLoading: status === 'loading',
    isError: status === 'error',
    isSuccess: status === 'ready',
  };
}
