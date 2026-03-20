'use client';

import { useContext } from 'react';
import { HeaderConfigContext } from './header-config-context';

export function useHeaderConfig() {
  const ctx = useContext(HeaderConfigContext);
  if (!ctx) throw new Error('useHeaderConfig must be used within HeaderConfigProvider');
  return ctx;
}
