'use client';

import { createContext } from 'react';
import type { MouseEvent } from 'react';
import type { VisibleEventDateRange } from '@/app/feed/_components/feed-client/useVisibleEventDateOnScroll';
import type { Modifiers } from 'react-day-picker';

export interface HeaderConfig {
  earliestEventDate?: string;
  visibleEventDateRange?: VisibleEventDateRange;
  onDayClick?: (day: Date, modifiers: Modifiers | undefined, e: MouseEvent | undefined) => void;
}

export interface HeaderConfigContextValue {
  config: HeaderConfig;
  setConfig: (next: HeaderConfig) => void;
}

export const HeaderConfigContext = createContext<HeaderConfigContextValue | null>(null);
