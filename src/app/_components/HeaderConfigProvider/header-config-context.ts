'use client';

import { createContext } from 'react';
import type { VisibleEventDateRange } from '@/app/feed/_components/feed-client/useVisibleEventDateOnScroll';

export interface HeaderConfig {
  earliestEventDate?: string;
  visibleEventDateRange?: VisibleEventDateRange;
  onDayClick?: (day: Date) => void;
}

export interface HeaderConfigContextValue {
  config: HeaderConfig;
  setConfig: (next: HeaderConfig) => void;
}

export const HeaderConfigContext = createContext<HeaderConfigContextValue | null>(null);
