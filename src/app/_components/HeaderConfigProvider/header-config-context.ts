import { createContext } from 'react';
import type { VisibleEventDateRange } from '@/app/feed/_components/feed-client/useVisibleEventDateOnScroll';

export type CalendarDatesStatus = 'loading' | 'ready' | 'error';

export interface HeaderConfig {
  earliestEventDate?: string;
  visibleEventDateRange?: VisibleEventDateRange;
  availableDates?: string[];
  calendarDatesStatus?: CalendarDatesStatus;
  calendarDatesError?: string;
  onDayClick?: (day: Date) => void;
}

export interface HeaderConfigContextValue {
  config: HeaderConfig;
  setConfig: (next: HeaderConfig) => void;
}

export const HeaderConfigContext = createContext<HeaderConfigContextValue | null>(null);
