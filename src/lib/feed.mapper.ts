import type { Event, V1GigGetResponseBodyGig } from '@/lib/types';
import { toLocalYMD } from '@/lib/utils';

export type CountryNameResolver = (iso: string) => string;

export interface GigToEventOptions {
  readonly resolveCountryName?: CountryNameResolver;
}

const toMs = (n: number) => (n < 1_000_000_000_000 ? n * 1000 : n); // seconds -> ms (heuristic)

export function gigDateToYMD(date: V1GigGetResponseBodyGig['date']): string {
  const s = String(date).trim();

  // "1705257600000" or "1705257600"
  if (/^\d+$/.test(s)) {
    const n = Number(s);
    return toLocalYMD(new Date(toMs(n)));
  }

  // ISO "2026-01-14T19:00:00.000Z"
  if (s.includes('T')) return s.slice(0, 10);

  // "YYYY-MM-DD"
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // Last resort parse (kept for backward compatibility with existing feed parsing).
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return toLocalYMD(d);

  return s;
}

export function gigToEvent(gig: V1GigGetResponseBodyGig, options: GigToEventOptions = {}): Event {
  const { resolveCountryName } = options;

  const date = gigDateToYMD(gig.date);
  const endDate = gig.endDate ? gigDateToYMD(gig.endDate) : undefined;

  return {
    id: gig.id,
    date,
    endDate,
    poster: gig.posterUrl,
    title: gig.title,
    venue: gig.venue,
    city: gig.city,
    country: {
      iso: gig.country,
      name: resolveCountryName ? resolveCountryName(gig.country) : '',
    },
    ticketsUrl: gig.ticketsUrl,
    calendarUrl: gig.calendarUrl,
    postUrl: gig.postUrl,
  };
}
