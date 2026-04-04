'use client';

import { useCallback, useState } from 'react';
import type { TelegramWidgetUser } from '@/types/telegram-login';

/**
 * In-memory session only: no sessionStorage until persistence is wired step by step.
 */
export interface UseTelegramSessionResult {
  readonly session: TelegramWidgetUser | null;
  readonly login: (user: TelegramWidgetUser) => void;
  readonly logout: () => void;
}

export function useTelegramSession(): UseTelegramSessionResult {
  const [session, setSession] = useState<TelegramWidgetUser | null>(null);

  const login = useCallback((user: TelegramWidgetUser) => {
    setSession(user);
  }, []);

  const logout = useCallback(() => {
    setSession(null);
  }, []);

  return { session, login, logout };
}
