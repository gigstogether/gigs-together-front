import { useCallback, useEffect, useRef } from 'react';
import { toLocalYMD } from '@/lib/utils';
import { useClearFeedLocationHash } from './useClearFeedLocationHash';
import type { FeedLoadingAction } from '@/app/feed/_lib/feedLoading';

export interface UseEventHashLoaderParams {
  readonly isEnabled: boolean;
  readonly isBusyRef: Readonly<{ current: boolean }>;
  readonly setIsBusy: (next: boolean) => void;
  readonly dispatchLoading: (action: FeedLoadingAction) => void;
  readonly setError: (message: string | null) => void;
  readonly bumpInfiniteScrollResetKey: () => void;
  readonly resolveAnchorYmdByEventId: (eventId: string) => Promise<string>;
  readonly loadAroundAndReplace: (anchorYmd: string) => Promise<void>;
}

export function useEventHashLoader(params: UseEventHashLoaderParams): void {
  const clearHashFromUrl = useClearFeedLocationHash();
  const {
    isEnabled,
    isBusyRef,
    setIsBusy,
    dispatchLoading,
    setError,
    bumpInfiniteScrollResetKey,
    resolveAnchorYmdByEventId,
    loadAroundAndReplace,
  } = params;

  const lastMissingHashTargetRef = useRef<string | null>(null);

  const ensureHashTargetLoaded = useCallback(async () => {
    if (!isEnabled) return;

    const hash = window.location.hash;
    if (!hash) {
      lastMissingHashTargetRef.current = null;
      return;
    }

    const id = hash.startsWith('#') ? hash.slice(1) : hash;
    if (!id) return;

    const el = document.getElementById(id);
    if (el) {
      lastMissingHashTargetRef.current = null;
      return;
    }

    if (isBusyRef.current) return;
    if (lastMissingHashTargetRef.current === id) return;
    lastMissingHashTargetRef.current = id;

    setIsBusy(true);
    dispatchLoading({ type: 'jump:start' });
    setError(null);
    bumpInfiniteScrollResetKey();

    try {
      const anchorYmd = await resolveAnchorYmdByEventId(id);
      const todayYmd = toLocalYMD(new Date());
      // Past events: redirect to same URL without anchor (feed shows only upcoming)
      if (anchorYmd < todayYmd) {
        clearHashFromUrl();
        return;
      }
      await loadAroundAndReplace(anchorYmd);

      // Double rAF: React may not have committed the DOM update after setState in a single frame.
      // First rAF runs before next paint; second gives React time to flush and render the new list.
      await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
      const after = document.getElementById(id);
      if (!after) {
        throw new Error(`Failed to locate target event after load: ${id}`);
      }
    } catch {
      // On any error: clear hash, clear error, show current feed.
      lastMissingHashTargetRef.current = null;
      setError(null);
      clearHashFromUrl();
    } finally {
      dispatchLoading({ type: 'jump:end' });
      setIsBusy(false);
    }
  }, [
    bumpInfiniteScrollResetKey,
    clearHashFromUrl,
    dispatchLoading,
    isBusyRef,
    isEnabled,
    loadAroundAndReplace,
    resolveAnchorYmdByEventId,
    setError,
    setIsBusy,
  ]);

  useEffect(() => {
    const onHashChange = () => {
      void ensureHashTargetLoaded();
    };
    window.addEventListener('hashchange', onHashChange);
    void ensureHashTargetLoaded();
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [ensureHashTargetLoaded]);
}
