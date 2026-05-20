'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { invalidateAuthMeQuery } from '@/lib/auth-me';

/** Re-validates session profile on each visit to the admin route segment. */
export default function AdminSessionRefresh() {
  const queryClient = useQueryClient();

  useEffect(() => {
    void invalidateAuthMeQuery(queryClient);
  }, [queryClient]);

  return null;
}
