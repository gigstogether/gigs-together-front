'use client';

import { Fragment, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import styles from '@/app/page.module.css';
import { toLocalYMD } from '@/lib/utils';

import '@/app/style.css';
import { MonthSection } from '@/app/_components/MonthSection';
import { GigCard } from '@/app/_components/GigCard';
import type { Event, V1GigDatesGetResponseBody, V1GigGetResponseBody } from '@/lib/types';
import { apiRequest } from '@/lib/api';
import { useT } from '@/lib/i18n/I18nProvider';
import { useHeaderConfig } from '@/app/_components/HeaderConfigProvider';
import type { CalendarDatesStatus } from '@/app/_components/HeaderConfigProvider';
import { FEED_PAGE_SIZE } from '@/lib/feed.constants';
import { gigDateToYMD, gigToEvent } from '@/lib/feed.mapper';

type FeedClientProps = {
  country: string; // ISO like "es"
  city: string; // slug like "barcelona"
  initialEvents?: Event[];
  initialPage?: number;
  initialHasMore?: boolean;
};

const DEFAULT_LOCALE = 'en-US';
const PAGE_SIZE = FEED_PAGE_SIZE;

const formatMonthTitle = (date: string): string => {
  return (
    new Date(date).toLocaleString(DEFAULT_LOCALE, { month: 'long' }) + ' ' + date.split('-')[0]
  );
};

function useHeaderHeight(selector = '[data-app-header]', fallback = 44) {
  const [h, setH] = useState(fallback);

  useEffect(() => {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) {
      // Still set the CSS variable using the fallback
      document.documentElement.style.setProperty('--header-h', `${fallback}px`);
      return;
    }

    const apply = (px: number) => {
      setH(px);
      // Store the variable globally; you can set it on your scroll container if it's separate
      document.documentElement.style.setProperty('--header-h', `${px}px`);
    };

    // Initial measurement
    apply(el.offsetHeight);

    const ro = new ResizeObserver(() => {
      apply(el.offsetHeight);
    });
    ro.observe(el);

    return () => ro.disconnect();
  }, [selector, fallback]);

  return h; // value in pixels
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isV1GigDatesGetResponseBody(value: unknown): value is V1GigDatesGetResponseBody {
  if (!isRecord(value)) return false;
  const dates = value['dates'];
  if (!Array.isArray(dates)) return false;
  return dates.every((x) => typeof x === 'string' || typeof x === 'number');
}

export default function FeedClient(props: FeedClientProps) {
  const { country, city, initialEvents, initialPage, initialHasMore } = props;

  const t = useT();
  const { setConfig: setHeaderConfig } = useHeaderConfig();
  const headerH = useHeaderHeight(); // will pick [data-app-header], fallback 44

  const [events, setEvents] = useState<Event[]>(() => initialEvents ?? []);
  const [calendarAvailableDates, setCalendarAvailableDates] = useState<string[] | undefined>();
  const [calendarDatesStatus, setCalendarDatesStatus] = useState<CalendarDatesStatus>('loading');
  const [calendarDatesError, setCalendarDatesError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(() => initialEvents === undefined);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(() => initialPage ?? 1);
  const [hasMore, setHasMore] = useState(() =>
    initialEvents !== undefined ? (initialHasMore ?? initialEvents.length === PAGE_SIZE) : true,
  );
  // Raw date from observer (updates on every scroll tick)
  const [rawVisibleEventDate, setRawVisibleEventDate] = useState<string | undefined>();
  // Debounced date passed to the header (stabilized)
  const [visibleEventDate, setVisibleEventDate] = useState<string | undefined>();

  const eventRefs = useRef<Map<string, HTMLElement>>(new Map());
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const headerOffsetHeightRef = useRef<number>(0);
  const anchorsRef = useRef<HTMLElement[]>([]);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const inFlightRef = useRef(false);
  const hasUserScrolledRef = useRef(false);
  const lastAutoScrolledHashRef = useRef<string | null>(null);
  const autoHighlightTimeoutRef = useRef<number | undefined>(undefined);
  const calendarAbortRef = useRef<AbortController | null>(null);
  const calendarRequestSeqRef = useRef<number>(0);
  const calendarDatesLoadedForLocationRef = useRef<string | null>(null);

  // Load all future event dates for this location to power the calendar (independent from feed pagination).
  useEffect(() => {
    // Lazy: only start after the primary feed has loaded.
    if (loading) return;
    if (error) return;

    const locationKey = `${country}|${city}`;
    if (calendarDatesLoadedForLocationRef.current === locationKey) return;

    const ac = new AbortController();
    calendarAbortRef.current?.abort();
    calendarAbortRef.current = ac;
    const seq = (calendarRequestSeqRef.current += 1);
    const timeoutId = window.setTimeout(() => {
      ac.abort();
    }, 15_000);

    setCalendarDatesStatus('loading');
    setCalendarDatesError(undefined);
    setCalendarAvailableDates(undefined);

    const run = async () => {
      try {
        const qs = new URLSearchParams();
        if (country) qs.set('country', country);
        if (city) qs.set('city', city);

        const res = await apiRequest<unknown>(`v1/gig/dates?${qs.toString()}`, 'GET', undefined, {
          signal: ac.signal,
        });

        if (!isV1GigDatesGetResponseBody(res)) {
          throw new Error('Invalid API response: expected { dates: (string | number)[] }');
        }

        const ymd = res.dates.map((x) => gigDateToYMD(String(x)));
        const unique = Array.from(new Set(ymd)).sort();

        if (ac.signal.aborted) return;
        if (seq !== calendarRequestSeqRef.current) return;

        setCalendarAvailableDates(unique);
        setCalendarDatesStatus('ready');
        calendarDatesLoadedForLocationRef.current = locationKey;
      } catch (e) {
        if (ac.signal.aborted) return;
        if (seq !== calendarRequestSeqRef.current) return;

        const message = e instanceof Error ? e.message : 'Failed to load calendar dates.';
        setCalendarDatesStatus('error');
        setCalendarDatesError(message);
        setCalendarAvailableDates(undefined);
      } finally {
        window.clearTimeout(timeoutId);
        if (calendarAbortRef.current === ac) calendarAbortRef.current = null;
      }
    };

    void run();
    return () => {
      window.clearTimeout(timeoutId);
      ac.abort();
    };
  }, [city, country, error, loading]);

  // Debounce raw visible date changes to avoid header jitter while scrolling
  useEffect(() => {
    if (!rawVisibleEventDate) {
      setVisibleEventDate(undefined);
      return;
    }
    const id = setTimeout(() => setVisibleEventDate(rawVisibleEventDate), 150);
    return () => clearTimeout(id);
  }, [rawVisibleEventDate]);

  useEffect(() => {
    headerOffsetHeightRef.current = headerH;
  }, [headerH]);

  const fetchPage = useCallback(
    async (nextPage: number, mode: 'replace' | 'append') => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;

      const qs = new URLSearchParams();
      qs.set('page', String(nextPage));
      qs.set('size', String(PAGE_SIZE));
      if (country) qs.set('country', country);
      if (city) qs.set('city', city);

      try {
        if (mode === 'replace') {
          setLoading(true);
          setError(null);
        } else {
          setLoadingMore(true);
        }

        const res = await apiRequest<V1GigGetResponseBody>(`v1/gig?${qs.toString()}`, 'GET');

        const mapped: Event[] = res.gigs.map((gig) =>
          gigToEvent(gig, { resolveCountryName: (iso) => t('country', iso) }),
        );

        setEvents((prev) => {
          const merged = mode === 'replace' ? mapped : [...prev, ...mapped];
          // Important: don't de-dupe on date/title/etc, otherwise distinct events can disappear.
          merged.sort((a, b) => a.date.localeCompare(b.date));
          return merged;
        });

        setPage(nextPage);
        // Stop when backend returns fewer than requested (or nothing).
        setHasMore(res.gigs.length === PAGE_SIZE);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
        setLoadingMore(false);
        inFlightRef.current = false;
      }
    },
    [city, country, t],
  );

  // Initial load (or hydrate from server) + refetch when params change
  useEffect(() => {
    if (initialEvents !== undefined) {
      setEvents(initialEvents);
      setPage(initialPage ?? 1);
      setHasMore(initialHasMore ?? initialEvents.length === PAGE_SIZE);
      setError(null);
      setLoading(false);
      setLoadingMore(false);
      inFlightRef.current = false;
      return;
    }

    fetchPage(1, 'replace');
  }, [country, city, fetchPage, initialEvents, initialHasMore, initialPage]);

  // When opening a URL that already contains a hash, the browser tries to scroll
  // before the feed items exist (because we load them client-side). Re-try once
  // after events render.
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
      el.scrollIntoView({ block: 'start', inline: 'nearest' });
      // Re-trigger highlight on initial load (when :target may have already "happened")
      el.classList.remove('gig-anchor-auto');
      // Force a reflow so the browser commits the class removal; otherwise
      // remove+add can be batched and the CSS animation won't restart.
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      el.offsetWidth;
      el.classList.add('gig-anchor-auto');

      if (autoHighlightTimeoutRef.current) {
        window.clearTimeout(autoHighlightTimeoutRef.current);
      }
      autoHighlightTimeoutRef.current = window.setTimeout(() => {
        el.classList.remove('gig-anchor-auto');
      }, 1800);
    });
  }, [events]);

  // Don't auto-load more until the user scrolls (prevents "burst" requests on short lists)
  useEffect(() => {
    const onScroll = () => {
      hasUserScrolledRef.current = true;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Infinite scroll: when sentinel becomes visible, load next page
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (!hit) return;
        if (!hasUserScrolledRef.current) return;
        if (loading || loadingMore || !hasMore) return;
        fetchPage(page + 1, 'append');
      },
      {
        root: null, // viewport (works with window scroll)
        rootMargin: '400px 0px',
        threshold: 0,
      },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [loading, loadingMore, hasMore, page, fetchPage]);

  const eventsByMonth = useMemo(() => {
    const grouped: Record<string, Event[]> = {};
    events.forEach((event) => {
      const monthYear = event.date.split('-').slice(0, 2).join('-');
      grouped[monthYear] = grouped[monthYear] || [];
      grouped[monthYear].push(event);
    });
    return grouped;
  }, [events]);

  const months = useMemo(() => {
    return Object.keys(eventsByMonth)
      .sort()
      .map((date) => ({
        date: date + '-01',
        events: eventsByMonth[date],
      }));
  }, [eventsByMonth]);

  const computeActiveDate = useCallback(() => {
    const headerH = headerOffsetHeightRef.current ?? 0;
    const anchors = anchorsRef.current;
    if (!anchors || anchors.length === 0) return;

    // Switch to the next anchor a bit *before* it touches the header.
    // This makes the month in the header update slightly earlier while scrolling.
    const EARLY_SWITCH_PX = 40;

    const withTop = anchors.map((el) => ({ el, top: el.getBoundingClientRect().top - headerH }));
    const firstBelow = withTop.filter((x) => x.top >= 0).sort((a, b) => a.top - b.top)[0];
    const closestAbove = withTop.filter((x) => x.top < 0).sort((a, b) => b.top - a.top)[0];
    const targetEl = (
      firstBelow && firstBelow.top < EARLY_SWITCH_PX ? firstBelow : (closestAbove ?? firstBelow)
    )?.el as HTMLElement | undefined;
    const dateAttr = targetEl?.dataset.date;
    if (dateAttr) setRawVisibleEventDate((prev) => (prev === dateAttr ? prev : dateAttr));
  }, []);

  // Observe anchors list after events render and compute initial active date
  useEffect(() => {
    // Use [data-date] anchors as the single source of truth
    anchorsRef.current = Array.from(document.querySelectorAll('[data-date]')) as HTMLElement[];
    // Compute once after anchors update
    computeActiveDate();
  }, [events, computeActiveDate]);

  // Scroll + resize handler using rAF for stability
  useEffect(() => {
    let ticking = false,
      frameId: number | undefined;

    const onScrollOrResize = () => {
      if (ticking) return;
      ticking = true;
      frameId = requestAnimationFrame(() => {
        computeActiveDate();
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [computeActiveDate]);

  // Register event element refs
  const registerEventRef = useCallback((eventId: string, element: HTMLElement | null) => {
    if (element) {
      eventRefs.current.set(eventId, element);
    } else {
      eventRefs.current.delete(eventId);
    }
  }, []);

  const handleDayClick = useCallback(
    (day: Date) => {
      const key = toLocalYMD(day);

      // First, try to find an explicit anchor by date (where you added data-date and scroll-mt-[44px])
      let target = document.querySelector<HTMLElement>(`[data-date="${key}"]`);

      // Fallback: if there is no anchor, jump to the first card for this date
      if (!target) {
        const firstEvent = events.find((e) => e.date === key);
        if (firstEvent) {
          target = eventRefs.current.get(String(firstEvent.id)) || null;
        }
      }

      if (!target) return;

      // `scrollIntoView` can overshoot in our layout; compute the scroll position manually.
      const headerPx = headerOffsetHeightRef.current ?? 0;
      // Tune this if needed: positive value means "stop a bit earlier" (less scroll down).
      const EXTRA_OFFSET_PX = 32;
      const top = window.scrollY + target.getBoundingClientRect().top - headerPx - EXTRA_OFFSET_PX;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    },
    [events],
  );

  useEffect(() => {
    setHeaderConfig({
      earliestEventDate: visibleEventDate,
      availableDates: calendarDatesStatus === 'ready' ? calendarAvailableDates : undefined,
      calendarDatesStatus,
      calendarDatesError,
      onDayClick: handleDayClick,
    });

    return () => {
      setHeaderConfig({});
    };
  }, [
    calendarAvailableDates,
    calendarDatesError,
    calendarDatesStatus,
    handleDayClick,
    setHeaderConfig,
    visibleEventDate,
  ]);

  if (loading) {
    return (
      <div className="min-h-[100svh]">
        <main className={styles.main}>
          <div className="flex justify-center items-center h-96">
            <div className="text-lg">Loading events...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[100svh]">
        <main className={styles.main}>
          <div className="flex justify-center items-center h-96">
            <div className="text-lg text-red-600">Error: {error}</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh]">
      <main
        className={styles.main}
        ref={(el) => {
          if (el) scrollContainerRef.current = el;
        }}
      >
        <div className="px-8 md:px-8 py-8">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl text-gray-600">No events found</h2>
              <p className="text-gray-500 mt-2">Check back later for upcoming events!</p>
            </div>
          ) : (
            months.map((month, monthIdx) => {
              const orderedMonthEvents = [...month.events].sort(
                (a, b) => a.date.localeCompare(b.date) || String(a.id).localeCompare(String(b.id)),
              );
              return (
                <MonthSection
                  key={month.date}
                  title={formatMonthTitle(month.date)}
                  date={month.date}
                  showDivider={monthIdx !== 0}
                >
                  {orderedMonthEvents.map((event, idx) => {
                    const prev = orderedMonthEvents[idx - 1];
                    const isFirstOfDate = idx === 0 || prev?.date !== event.date;

                    return (
                      <Fragment key={event.id}>
                        <div
                          id={event.id}
                          data-date={isFirstOfDate ? event.date : undefined}
                          data-event-id={event.id}
                          ref={(el) => registerEventRef(event.id, el)}
                          className="gig-anchor"
                        >
                          <GigCard gig={event} />
                        </div>
                      </Fragment>
                    );
                  })}
                </MonthSection>
              );
            })
          )}

          {/* Infinite scroll sentinel */}
          <div ref={loadMoreRef} className="h-12" aria-hidden />
          {loadingMore ? <div className="py-4 text-center text-gray-500">Loading more…</div> : null}
        </div>
      </main>
    </div>
  );
}
