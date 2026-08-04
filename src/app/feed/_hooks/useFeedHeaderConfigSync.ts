import { useEffect } from 'react';
import type { HeaderConfig } from '@/app/feed/_providers/HeaderConfigProvider';
import type { VisibleEventDateRange } from './useVisibleEventDateOnScroll';

export interface UseFeedHeaderConfigSyncParams {
  setHeaderConfig: (next: HeaderConfig) => void;
  visibleEventDate: string | undefined;
  visibleEventDateRange: VisibleEventDateRange | undefined;
  onDayClick: (day: Date) => void;
}

export function useFeedHeaderConfigSync(params: UseFeedHeaderConfigSyncParams) {
  const { setHeaderConfig, visibleEventDate, visibleEventDateRange, onDayClick } = params;

  useEffect(() => {
    setHeaderConfig({
      earliestEventDate: visibleEventDate,
      visibleEventDateRange,
      onDayClick,
    });

    return () => {
      setHeaderConfig({});
    };
  }, [onDayClick, setHeaderConfig, visibleEventDate, visibleEventDateRange]);
}
