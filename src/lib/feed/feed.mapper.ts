import type { Event, V1GigDatesGetResponseBody, V1GigGetResponseBodyGig } from '@/lib/types';
import { toLocalYMD } from '@/lib/utils';

export type CountryNameResolver = (iso: string) => string;
export type CityNameResolver = (code: string) => string;
export type GigDateInput = V1GigGetResponseBodyGig['date'] | number;
export type GigDatesInput = V1GigDatesGetResponseBody['dates'];

export interface GigToEventOptions {
  readonly resolveCountryName?: CountryNameResolver;
  readonly resolveCityName?: CityNameResolver;
}

const YMD_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DIGITS_RE = /^\d+$/;
const UNIX_SECONDS_RE = /^\d{10}$/;
const UNIX_MILLISECONDS_RE = /^\d{13}$/;
const ISO_DATETIME_RE = /^\d{4}-\d{2}-\d{2}T/;

function isValidYmd(value: string): boolean {
  const match = value.match(YMD_RE);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const candidate = new Date(Date.UTC(year, month - 1, day));

  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() + 1 === month &&
    candidate.getUTCDate() === day
  );
}

function parseUnixTimestampToYmd(value: string): string {
  if (UNIX_SECONDS_RE.test(value)) {
    return toLocalYMD(new Date(Number(value) * 1000));
  }
  if (UNIX_MILLISECONDS_RE.test(value)) {
    return toLocalYMD(new Date(Number(value)));
  }
  throw new Error(
    `Invalid gig date "${value}": unix timestamp must be exactly 10 (seconds) or 13 (milliseconds) digits`,
  );
}

export function gigDateToYMD(date: GigDateInput): string {
  if (typeof date === 'number') {
    if (!Number.isFinite(date) || !Number.isInteger(date)) {
      throw new Error(
        `Invalid gig date "${date}": numeric date must be a finite integer timestamp`,
      );
    }
    return parseUnixTimestampToYmd(String(date));
  }

  const value = date.trim();
  if (!value) {
    throw new Error('Invalid gig date: value is empty');
  }

  if (DIGITS_RE.test(value)) {
    return parseUnixTimestampToYmd(value);
  }

  if (YMD_RE.test(value)) {
    if (!isValidYmd(value)) {
      throw new Error(`Invalid gig date "${value}": invalid calendar date`);
    }
    return value;
  }

  if (ISO_DATETIME_RE.test(value)) {
    if (Number.isNaN(Date.parse(value))) {
      throw new Error(`Invalid gig date "${value}": malformed ISO date-time`);
    }
    const ymd = value.slice(0, 10);
    if (!isValidYmd(ymd)) {
      throw new Error(`Invalid gig date "${value}": invalid ISO date-time`);
    }
    return ymd;
  }

  throw new Error(
    `Invalid gig date "${value}": expected YYYY-MM-DD, ISO date-time, or unix timestamp (10/13 digits)`,
  );
}

export function gigDatesToSortedUniqueYmd(dates: GigDatesInput): string[] {
  const ymd = dates.map((date) => gigDateToYMD(date));
  return Array.from(new Set(ymd)).sort();
}

export function gigToEvent(gig: V1GigGetResponseBodyGig, options: GigToEventOptions = {}): Event {
  const { resolveCountryName, resolveCityName } = options;

  const date = gigDateToYMD(gig.date);
  const endDate = gig.endDate ? gigDateToYMD(gig.endDate) : undefined;

  return {
    id: gig.id,
    date,
    endDate,
    poster: gig.posterUrl,
    title: gig.title,
    venue: gig.venue,
    city: {
      code: gig.city,
      name: resolveCityName ? resolveCityName(gig.city) : '',
    },
    country: {
      iso: gig.country,
      name: resolveCountryName ? resolveCountryName(gig.country) : '',
    },
    ticketsUrl: gig.ticketsUrl,
    calendarUrl: gig.calendarUrl,
    postUrl: gig.postUrl,
  };
}
