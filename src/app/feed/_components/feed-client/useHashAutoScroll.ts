import { useEffect, useRef, useState } from 'react';
import type { Event } from '@/lib/types';

export interface UseHashAutoScrollParams {
  readonly events: Event[];
  readonly highlightClass?: string;
  readonly highlightDurationMs?: number;
  readonly headerOffsetPx?: number;
  readonly extraOffsetPx?: number;
}

export function useHashAutoScroll(params: UseHashAutoScrollParams) {
  const {
    events,
    highlightClass = 'gig-anchor-auto',
    highlightDurationMs = 1800,
    headerOffsetPx = 0,
    extraOffsetPx = 0,
  } = params;

  /**
   * Once we have run auto-scroll+highlight for this hash, do not repeat on `events` updates
   * (e.g. infinite scroll).
   * */
  const completedAutoScrollForHashRef = useRef<string | null>(null);
  const [hashBump, setHashBump] = useState(0);
  const autoHighlightTimeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const onHashChange = () => {
      completedAutoScrollForHashRef.current = null;
      setHashBump((b) => b + 1);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) {
      completedAutoScrollForHashRef.current = null;
      return;
    }
    if (completedAutoScrollForHashRef.current === hash) return;

    const id = hash.startsWith('#') ? hash.slice(1) : hash;
    if (!id) return;

    const el = document.getElementById(id);
    if (!el) return;

    completedAutoScrollForHashRef.current = hash;
    requestAnimationFrame(() => {
      const top = window.scrollY + el.getBoundingClientRect().top - headerOffsetPx - extraOffsetPx;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      el.classList.remove(highlightClass);
      // Force a reflow so the class removal is committed and the CSS animation
      // reliably restarts when we add the class again.
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      el.offsetWidth;
      el.classList.add(highlightClass);

      if (autoHighlightTimeoutRef.current) {
        window.clearTimeout(autoHighlightTimeoutRef.current);
      }
      autoHighlightTimeoutRef.current = window.setTimeout(() => {
        el.classList.remove(highlightClass);
      }, highlightDurationMs);
    });
  }, [events, extraOffsetPx, headerOffsetPx, highlightClass, highlightDurationMs, hashBump]);

  useEffect(() => {
    return () => {
      if (autoHighlightTimeoutRef.current) window.clearTimeout(autoHighlightTimeoutRef.current);
    };
  }, []);
}
