'use client';

import { useEffect } from 'react';
import type { HeaderConfig } from '@/app/_components/HeaderConfigProvider';
import type { VisibleEventDateRange } from './useVisibleEventDateOnScroll';

export interface UseFeedHeaderConfigSyncParams {
  setHeaderConfig: (next: HeaderConfig) => void;
  visibleEventDate: string | undefined;
  visibleEventDateRange: VisibleEventDateRange | undefined;
  availableDates: string[] | undefined;
  calendarDatesIsLoading: boolean;
  calendarDatesIsError: boolean;
  calendarDatesError: string | undefined;
  onDayClick: (day: Date) => void;
}

export function useFeedHeaderConfigSync(params: UseFeedHeaderConfigSyncParams) {
  const {
    setHeaderConfig,
    visibleEventDate,
    visibleEventDateRange,
    availableDates,
    calendarDatesIsLoading,
    calendarDatesIsError,
    calendarDatesError,
    onDayClick,
  } = params;

  useEffect(() => {
    setHeaderConfig({
      earliestEventDate: visibleEventDate,
      visibleEventDateRange,
      availableDates,
      calendarDatesIsLoading,
      calendarDatesIsError,
      calendarDatesError,
      onDayClick,
    });

    return () => {
      setHeaderConfig({});
    };
  }, [
    availableDates,
    calendarDatesError,
    calendarDatesIsLoading,
    calendarDatesIsError,
    onDayClick,
    setHeaderConfig,
    visibleEventDate,
    visibleEventDateRange,
  ]);
}
