'use client';

import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import type { HeaderConfig } from './header-config-context';
import { HeaderConfigContext } from './header-config-context';

export function HeaderConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<HeaderConfig>({});

  const value = useMemo(() => ({ config, setConfig }), [config]);

  return <HeaderConfigContext.Provider value={value}>{children}</HeaderConfigContext.Provider>;
}
