import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/**
 * Returns a callback that drops the current location hash while keeping pathname + search.
 * Call the result only from client handlers / effects — not during SSR render.
 */
export function useClearFeedLocationHash(): () => void {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useCallback(() => {
    const hasHash = Boolean(window.location.hash);
    if (!hasHash) {
      return;
    }

    const query = searchParams.toString();
    const search = query ? `?${query}` : '';
    const url = `${pathname ?? ''}${search}`;
    window.history.replaceState(null, '', url);
    router.replace(url as Parameters<typeof router.replace>[0]);
  }, [pathname, router, searchParams]);
}
