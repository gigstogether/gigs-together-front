import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Returns a callback that drops the current location hash while keeping pathname + search.
 * Reads path/search from `window.location` (not `useSearchParams`) so the feed route can stay
 * statically prerendered without a CSR bailout.
 * Call the result only from client handlers / effects — not during SSR render.
 */
export function useClearFeedLocationHash(): () => void {
  const router = useRouter();

  return useCallback(() => {
    const hasHash = Boolean(window.location.hash);
    if (!hasHash) {
      return;
    }

    const url = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState(null, '', url);
    router.replace(url as Parameters<typeof router.replace>[0]);
  }, [router]);
}
