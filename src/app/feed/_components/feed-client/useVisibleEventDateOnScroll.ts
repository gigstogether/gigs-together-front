import { useCallback, useEffect, useRef, useState } from 'react';
import type { Event } from '@/lib/types';

export interface UseVisibleEventDateOnScrollParams {
  readonly events: Event[];
  readonly headerOffsetPx: number;
  readonly anchorSelector?: string;
  readonly debounceMs?: number;
  readonly earlySwitchPx?: number;
  readonly rowTolerancePx?: number;
}

export interface VisibleEventDateRange {
  readonly startDate: string;
  readonly endDate: string;
}

export interface UseVisibleEventDateOnScrollResult {
  readonly visibleEventDate: string | undefined;
  readonly visibleEventDateRange: VisibleEventDateRange | undefined;
}

export function useVisibleEventDateOnScroll(
  params: UseVisibleEventDateOnScrollParams,
): UseVisibleEventDateOnScrollResult {
  const {
    events,
    headerOffsetPx,
    anchorSelector = '[data-event-date]',
    debounceMs = 150,
    earlySwitchPx = 40,
    rowTolerancePx = 12,
  } = params;

  const anchorsRef = useRef<HTMLElement[]>([]);
  const pendingVisibleDateRef = useRef<string | undefined>(undefined);
  const pendingVisibleDateRangeKeyRef = useRef<string | undefined>(undefined);
  const debounceTimeoutRef = useRef<number | undefined>(undefined);

  const [visibleEventDate, setVisibleEventDate] = useState<string | undefined>();
  const [visibleEventDateRange, setVisibleEventDateRange] = useState<VisibleEventDateRange>();

  const scheduleVisibleDateCommit = useCallback(
    (next: string | undefined, nextRange: VisibleEventDateRange | undefined) => {
      if (debounceTimeoutRef.current) window.clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = window.setTimeout(() => {
        setVisibleEventDate(next);
        setVisibleEventDateRange(nextRange);
      }, debounceMs);
    },
    [debounceMs],
  );

  const computeActiveDate = useCallback(() => {
    const anchors = anchorsRef.current;
    if (!anchors || anchors.length === 0) return;

    const withTop = anchors.map((el) => ({
      el,
      top: el.getBoundingClientRect().top - headerOffsetPx,
    }));
    const firstBelow = withTop.filter((x) => x.top >= 0).sort((a, b) => a.top - b.top)[0];
    const closestAbove = withTop.filter((x) => x.top < 0).sort((a, b) => b.top - a.top)[0];
    const targetEl = (
      firstBelow && firstBelow.top < earlySwitchPx ? firstBelow : (closestAbove ?? firstBelow)
    )?.el;

    const next = targetEl?.dataset.eventDate;
    const targetTop = withTop.find((item) => item.el === targetEl)?.top;
    const rowDates =
      targetTop === undefined
        ? []
        : withTop
            .filter((item) => Math.abs(item.top - targetTop) <= rowTolerancePx)
            .map((item) => item.el.dataset.eventDate)
            .filter((date): date is string => typeof date === 'string')
            .sort();
    const nextRange =
      rowDates.length === 0
        ? undefined
        : {
            startDate: rowDates[0],
            endDate: rowDates[rowDates.length - 1],
          };
    const nextRangeKey = nextRange ? `${nextRange.startDate}|${nextRange.endDate}` : undefined;
    if (
      pendingVisibleDateRef.current === next &&
      pendingVisibleDateRangeKeyRef.current === nextRangeKey
    ) {
      return;
    }
    pendingVisibleDateRef.current = next;
    pendingVisibleDateRangeKeyRef.current = nextRangeKey;
    scheduleVisibleDateCommit(next, nextRange);
  }, [earlySwitchPx, headerOffsetPx, rowTolerancePx, scheduleVisibleDateCommit]);

  useEffect(() => {
    anchorsRef.current = Array.from(document.querySelectorAll<HTMLElement>(anchorSelector));
    requestAnimationFrame(() => computeActiveDate());
  }, [anchorSelector, computeActiveDate, events]);

  useEffect(() => {
    requestAnimationFrame(() => computeActiveDate());
  }, [computeActiveDate, headerOffsetPx]);

  useEffect(() => {
    let ticking = false;
    let frameId: number | undefined;

    const schedule = () => {
      if (ticking) return;
      ticking = true;
      frameId = requestAnimationFrame(() => {
        computeActiveDate();
        ticking = false;
      });
    };

    const onScroll = () => schedule();
    const onResize = () => schedule();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [computeActiveDate]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) window.clearTimeout(debounceTimeoutRef.current);
    };
  }, []);

  return { visibleEventDate, visibleEventDateRange };
}
