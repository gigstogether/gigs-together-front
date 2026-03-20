import { createContext } from 'react';

export type CalendarDatesStatus = 'loading' | 'ready' | 'error';

export interface HeaderConfig {
  earliestEventDate?: string;
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
