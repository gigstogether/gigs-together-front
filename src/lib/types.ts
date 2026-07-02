declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe?: {
          start_param?: string;
          user?: {
            id: number;
          };
        };
      };
    };
  }
}

export type Event = {
  id: string;
  date: string;
  endDate?: string;
  poster?: string;
  title: string;
  venue: string;
  city: string;
  country: {
    iso: string;
    name: string;
  };
  ticketsUrl?: string;
  calendarUrl?: string;
  postUrl?: string;
};

export interface V1GigGetResponseBody {
  gigs: V1GigGetResponseBodyGig[];
  prevCursor?: string;
  nextCursor?: string;
}

export interface V1GigDatesGetResponseBody {
  dates: Array<string | number>;
}

export interface V1GigAroundGetResponseBody {
  before: V1GigGetResponseBodyGig[];
  after: V1GigGetResponseBodyGig[];
  prevCursor?: string;
  nextCursor?: string;
}

/** GET v1/gig/date/:publicId — anchor date for hash / deep links */
export interface V1GigByPublicIdGetResponseBody {
  date: string | number;
}

export interface V1GigGetResponseBodyGig {
  id: string;
  title: string;
  date: string | number;
  endDate?: string | number;
  city: string;
  country: string;
  venue: string;
  ticketsUrl: string;
  posterUrl?: string;
  calendarUrl?: string;
  postUrl?: string;
}

export type LocaleIso = 'en' | 'ru' | 'es' | string;

export {};
