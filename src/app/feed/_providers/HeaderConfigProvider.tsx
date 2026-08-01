'use client';

import type { MouseEvent, ReactNode } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';
import type { VisibleEventDateRange } from '@/app/feed/_lib/useVisibleEventDateOnScroll';
import type { Modifiers } from 'react-day-picker';

export interface HeaderConfig {
  earliestEventDate?: string;
  visibleEventDateRange?: VisibleEventDateRange;
  onDayClick?: (day: Date, modifiers: Modifiers | undefined, e: MouseEvent | undefined) => void;
}

interface HeaderConfigContextValue {
  config: HeaderConfig;
  setConfig: (next: HeaderConfig) => void;
}

const HeaderConfigContext = createContext<HeaderConfigContextValue | null>(null);

interface HeaderConfigProviderProps {
  readonly children: ReactNode;
}

export function HeaderConfigProvider(props: HeaderConfigProviderProps) {
  const { children } = props;

  const [config, setConfig] = useState<HeaderConfig>({});

  const value = useMemo(() => ({ config, setConfig }), [config]);

  return <HeaderConfigContext.Provider value={value}>{children}</HeaderConfigContext.Provider>;
}

export function useHeaderConfig(): HeaderConfigContextValue {
  const ctx = useContext(HeaderConfigContext);
  if (!ctx) throw new Error('useHeaderConfig must be used within HeaderConfigProvider');
  return ctx;
}
