'use client';

import { useEffect, useRef } from 'react';
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

  const lastAutoScrolledHashRef = useRef<string | null>(null);
  const autoHighlightTimeoutRef = useRef<number | undefined>(undefined);

  // When a user clicks a hash link (e.g. event title), the browser scrolls natively.
  // We must mark that hash as "handled" so we don't re-scroll when events change.
  useEffect(() => {
    const syncHashHandled = () => {
      const hash = window.location.hash;
      if (!hash) return;
      const id = hash.startsWith('#') ? hash.slice(1) : hash;
      if (id && document.getElementById(id)) {
        lastAutoScrolledHashRef.current = hash;
      }
    };
    window.addEventListener('hashchange', syncHashHandled);
    syncHashHandled();
    return () => window.removeEventListener('hashchange', syncHashHandled);
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) {
      lastAutoScrolledHashRef.current = null;
      return;
    }
    if (lastAutoScrolledHashRef.current === hash) return;

    const id = hash.startsWith('#') ? hash.slice(1) : hash;
    if (!id) return;

    const el = document.getElementById(id);
    if (!el) return;

    lastAutoScrolledHashRef.current = hash;
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
  }, [events, extraOffsetPx, headerOffsetPx, highlightClass, highlightDurationMs]);

  useEffect(() => {
    return () => {
      if (autoHighlightTimeoutRef.current) window.clearTimeout(autoHighlightTimeoutRef.current);
    };
  }, []);
}
